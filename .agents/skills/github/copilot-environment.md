# Skill: Environment & Tooling Constraints

## 1. Package Management Restriction
* **STRICT RULE:** The project uses `pnpm`.
* NEVER suggest commands using `npm`, `yarn`, or `bun`.
* All installation suggestions must follow the pattern: `pnpm add <package>` or `pnpm install`.

## 2. Terminal & Scripting
* All suggested terminal commands, `package.json` scripts, or CI/CD steps must be standard `bash` / POSIX compliant.
* Do not use Windows-specific terminal commands (like `dir` or `del`). Suggest `ls` or `rm -rf`.

## 3. Styling Constraints
* The project utilizes Tailwind CSS.
* When suggesting UI components, use Tailwind utility classes exclusively.
* Do not suggest inline CSS `style={{ ... }}` in React components unless absolutely necessary for dynamic positional math.
