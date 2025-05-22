# env-consistency

> A CLI tool to ensure your `.env.*` files are consistent with a reference, all via a simple `npx` command.

## 🔍 Why Use This

When you have multiple environment files (e.g., `.env.local`, `.env.staging`, `.env.production`), it's easy for keys to get out of sync. Missing or extra variables can cause bugs that only appear in specific environments.

> ⚠️ **Note**: All `.env.*` files must be located in the root directory of your project for the tool to work properly.

**env-consistency** helps by:

-   **Comparing** selected `.env.*` files against a reference (`.env.dist` by default).
-   **Reporting** missing or extra keys in each file.
-   **Optionally adding** missing keys with a default value (`foo-bar`).
-   **Reordering** keys to match the reference order (extras appended alphabetically).
-   **Exiting** with a non-zero status on inconsistencies (great for CI).

## ⚙️ Installation (Using npx)

No install required! Run directly with `npx`:

```bash
npx env-consistency
```

This will download and execute the latest version of the tool.

## 📦 Usage

Simply run:

```bash
npx env-consistency
```

You'll be prompted to:

1. **Select** which `.env.*` files to check (e.g., `local`, `staging`, `production`, etc.).
2. **Enter** the reference file name (defaults to `.env.dist`).

After selection, the tool will:

-   **Log** missing files, missing keys, and extra keys.
-   **Ask** if you'd like to auto-add missing keys with value `foo-bar`.
-   **Reorder** each file to match the reference key order.

On completion, it exits with:

-   **0** if all files are consistent.
-   **1** if any inconsistencies were found.

## 🚀 Example Session

```bash
$ npx env-consistency
🔧 env-consistency starting…
? Which .env files do you want to check? › ◉ local ◯ staging ◯ production
? Reference file to compare against: (.env.dist)

⚠️ Issues in .env.local:
  • Missing keys: API_KEY, TIMEOUT
  • Extra keys:   DEBUG_MODE
? Add missing keys to .env.local with value 'foo-bar'? › (Y/n) Y
    ✔ API_KEY=foo-bar added
    ✔ TIMEOUT=foo-bar added
🔄 .env.local reordered

✅ .env.staging: All keys match
✅ .env.production: All keys match
```

## 🎯 CI Integration

Use in your CI pipeline to fail builds on env mismatches:

```yaml
- name: Check env consistency
  run: npx env-consistency
```

## 🤝 Contributing & Support

Contributions welcome! Open an issue or PR on the GitHub repo.

---

_Published via [env-consistency](https://www.npmjs.com/package/env-consistency)_
