# Dependency State

Last reviewed: 2026-11-16

State file for the `upgrade-deps` skill (rules: `~/.agents/custom-skills/upgrade-deps/SKILL.md`).
Full per-pass detail lives in `git log -p DEPENDENCIES.md pnpm-lock.yaml`.

## House rules

- **Package manager:** pnpm 11.5.1, pinned in `package.json` `packageManager` and `mise.toml`. Run tools through mise.
- **Runtime:** Node 24.16.0 (`mise.toml`). `@types/node` is still on 22: it follows the runtime once the runtime row below lands.
- **Gate:** `pnpm-workspace.yaml` minimum release age, and `.github/dependabot.yml` cooldown of 5 days.
- **Green gate:** `pnpm check`, `pnpm test`, `pnpm build`.
- **Deploys on push to master:** `ci-master.yml` runs release-please and publishes `@eturino/claims` to npm when the version changed.
- **`dist/` is tracked.** A local build rewrites it; restore it with `git checkout -- dist` unless the change is a release.

## Major Upgrades Blocked

Every row below was deferred by Edu on 2026-11-16 ("not now, next deps pass"), not blocked upstream. Not tried yet.

| Package | Current | Latest | Blocker | Since | Re-checked | Last tried |
| ------- | ------- | ------ | ------- | ----- | ---------- | ---------- |
| Node (runtime, `mise.toml`) | 24.16.0 | 26.13.1 | Deferred to the next pass. Take `@types/node` with it | 2026-11-16 | 2026-11-16 | - |
| `pnpm` (`packageManager`, `mise.toml`) | 11.5.1 | 12.21.0 | Deferred to the next pass | 2026-11-16 | 2026-11-16 | - |
| `@biomejs/biome` | 1.9.4 | 2.6.6 | Deferred. Needs `biome migrate` (config format changed in 2.x) | 2026-11-16 | 2026-11-16 | - |
| `typescript` | 5.7.3 | 7.0.2 | Deferred. Two majors: try 6 first | 2026-11-16 | 2026-11-16 | - |
| `vitest`, `@vitest/coverage-v8` | 3.2.7 | 5.1.0 | Deferred. Two majors, move both together | 2026-11-16 | 2026-11-16 | - |
| `tsup` | 8.5.1 | 9.0.0 | Deferred. It builds the published `dist/`: compare the output | 2026-11-16 | 2026-11-16 | - |
| `@types/node` | 22.20.5 | 26.6.6 | Follows the Node row | 2026-11-16 | 2026-11-16 | - |
| `@commitlint/cli`, `config-conventional` | 19.8.1 | 21.2.4 | Deferred. `cz-commitlint` already moved to 21.2.4 (Dependabot, 2026-11-16) | 2026-11-16 | 2026-11-16 | - |
| `inquirer` | 9.3.7 | 14.3.0 | Deferred. Only commitizen uses it | 2026-11-16 | 2026-11-16 | - |

## Upgrade history

- **2026-11-16** npm to pnpm migration landed (from June 2026), lockfile regenerated on master's dependencies, CI SHA-pinned with mise.
