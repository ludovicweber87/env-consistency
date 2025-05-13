#!/usr/bin/env node

(async () => {
    const fs = require("fs");
    const path = require("path");
    const dotenv = require("dotenv");
    const inquirerModule = await import("inquirer");
    const inquirer = inquirerModule.default;

    // 1) Ask which .env files to check
    const { envs } = await inquirer.prompt([
        {
            type: "checkbox",
            name: "envs",
            message: "Which .env files do you want to check?",
            choices: ["local", "staging", "production", "test", "example"].map(
                (v) => ({ name: v, value: v })
            ),
            validate: (sel) =>
                sel.length ? true : "Select at least one environment",
        },
    ]);

    // 2) Ask for the reference file
    const { dist } = await inquirer.prompt([
        {
            type: "input",
            name: "dist",
            message: "Reference file to compare against:",
            default: ".env.dist",
            validate: (v) =>
                v.trim() ? true : "Reference file name is required",
        },
    ]);

    const cwd = process.cwd();
    const refPath = path.join(cwd, dist);
    if (!fs.existsSync(refPath)) {
        console.error(`❌ Reference file not found: ${dist}`);
        process.exit(1);
    }

    // 3) Parse reference keys in order
    const reference = dotenv.parse(fs.readFileSync(refPath));
    const refKeys = Object.keys(reference);

    let hadError = false;

    // 4) Process each selected env file
    for (const env of envs) {
        const fileName = `.env.${env}`;
        const filePath = path.join(cwd, fileName);

        if (!fs.existsSync(filePath)) {
            console.error(`❌ File missing: ${fileName}`);
            hadError = true;
            continue;
        }

        const content = fs.readFileSync(filePath, "utf8");
        const vars = dotenv.parse(content);
        const varKeys = Object.keys(vars);

        const missing = refKeys.filter((k) => !varKeys.includes(k));
        const extra = varKeys.filter((k) => !refKeys.includes(k));

        if (missing.length || extra.length) {
            console.log(`\n⚠️ Issues in ${fileName}:`);
            if (missing.length)
                console.log(`  • Missing keys: ${missing.join(", ")}`);
            if (extra.length)
                console.log(`  • Extra keys:   ${extra.join(", ")}`);
            hadError = true;

            // Offer to add missing keys with default value
            if (missing.length) {
                const { add } = await inquirer.prompt([
                    {
                        type: "confirm",
                        name: "add",
                        message: `Add missing keys to ${fileName}?`,
                        default: false,
                    },
                ]);
                if (add) {
                    missing.forEach((k) => {
                        vars[k] = "foo-bar";
                        console.log(`    ✔ ${k}=foo-bar added`);
                    });
                }
            }
        } else {
            console.log(`\n✅ ${fileName}: All keys match`);
        }

        // 5) Reorder & write back
        const sortedVars = {};
        // first reference order (including newly added)
        refKeys.forEach((k) => {
            if (vars.hasOwnProperty(k)) sortedVars[k] = vars[k];
        });
        // then extra keys, sorted alphabetically
        extra.sort().forEach((k) => {
            sortedVars[k] = vars[k];
        });

        // write file with trailing newline
        const lines = Object.entries(sortedVars).map(([k, v]) => `${k}=${v}`);
        fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
        console.log(`🔄 ${fileName} reordered`);
    }

    process.exit(hadError ? 1 : 0);
})();
