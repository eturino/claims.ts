# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.5](https://github.com/eturino/claims.ts/compare/v0.4.3...v0.4.5) (2025-01-09)


### Bug Fixes

* better key-set peerDependency ([0e5a384](https://github.com/eturino/claims.ts/commit/0e5a384844dae8ae0771d2ab819d2ace106d30d5))
* **deps:** bump es-toolkit from 1.27.0 to 1.29.0 ([#563](https://github.com/eturino/claims.ts/issues/563)) ([2e8ebd3](https://github.com/eturino/claims.ts/commit/2e8ebd3af9e8af6f790c966a28e4c3e95f702327))
* **deps:** bump es-toolkit from 1.29.0 to 1.30.1 ([#568](https://github.com/eturino/claims.ts/issues/568)) ([ba5b655](https://github.com/eturino/claims.ts/commit/ba5b655a392d23aa7cec5ae5d2cdf566d64b58d5))
* **deps:** bump es-toolkit from 1.30.1 to 1.31.0 ([#571](https://github.com/eturino/claims.ts/issues/571)) ([24e8544](https://github.com/eturino/claims.ts/commit/24e8544229cac6b95283fde1988789cbe04c6829))
* updated dependencies, including updated @eturino/key-set peerDependency ([b5def87](https://github.com/eturino/claims.ts/commit/b5def8701bb7fa8f7aebde64464e987039f6cb0c))

### [0.4.4](https://github.com/eturino/claims.ts/compare/v0.4.3...v0.4.4) (2025-01-08)


### Bug Fixes

* updated dependencies, including updated @eturino/key-set peerDependency ([5fa39ac](https://github.com/eturino/claims.ts/commit/5fa39ac2002a347ec5495f21b69709a277b56285))

### [0.4.3](https://github.com/eturino/claims.ts/compare/v0.4.2...v0.4.3) (2024-11-20)


### Features

* enhance types to allow for readonly arguments ([a04ffe1](https://github.com/eturino/claims.ts/commit/a04ffe1ef06ef95a054d2482661f28790cf1d324))


### Bug Fixes

* **deps:** bump es-toolkit from 1.26.1 to 1.27.0 ([#549](https://github.com/eturino/claims.ts/issues/549)) ([07a09d3](https://github.com/eturino/claims.ts/commit/07a09d3ab3f41f04a2fdf01c65cf82cd4e4b1f9b))

### [0.4.2](https://github.com/eturino/claims.ts/compare/v0.4.1...v0.4.2) (2024-11-05)


### Bug Fixes

* fixing tests and lodash usage ([7d15fb2](https://github.com/eturino/claims.ts/commit/7d15fb27dfef1858b47eaafaa42ae69d085f31ad))

### [0.4.1](https://github.com/eturino/claims.ts/compare/v0.3.1...v0.4.1) (2024-11-05)


### Features

* replace lodash with es-toolkit, plus migrating to new project structure, ci, and tooling ([#548](https://github.com/eturino/claims.ts/issues/548)) ([d8342fe](https://github.com/eturino/claims.ts/commit/d8342fe3bdfcd70192a4a2eed79b3cc038087c6d))

### [0.3.1](https://github.com/eturino/claims.ts/compare/v0.3.0...v0.3.1) (2023-09-19)


### Features

* adding more allowed verbs: "admin", "read", "delete", "create", "update", "manage" ([6e90a42](https://github.com/eturino/claims.ts/commit/6e90a42a9fc6f7b59d26ffd93b78ef9b35050322))

## [0.3.0](https://github.com/eturino/claims.ts/compare/v0.2.1...v0.3.0) (2022-04-06)


### ⚠ BREAKING CHANGES

* the peer dependency of @eturino/key-set is updated to v5.x

### Features

* adding clone() and updating to KeySet 5.x ([1e02765](https://github.com/eturino/claims.ts/commit/1e02765af382e53851c433458328b50340be7edb))

### [0.2.1](https://github.com/eturino/claims.ts/compare/v0.2.0...v0.2.1) (2022-02-23)


### Features

* added `claimSet.toJSONString()` and `ability.cacheID` ([5580d3f](https://github.com/eturino/claims.ts/commit/5580d3f83ca0680cd4b49d5447128f0d5034317a))

## [0.2.0](https://github.com/eturino/claims.ts/compare/v0.1.10...v0.2.0) (2022-02-21)


### ⚠ BREAKING CHANGES

* The type of the `verb` of a claim is now AllowedVerbs which is `"admin" | "read"`

### Features

* frozen claim set ([dfbf30d](https://github.com/eturino/claims.ts/commit/dfbf30d278dd18fbbbbeee33a8e7e2c50bfd5fd1))

### [0.1.10](https://github.com/eturino/claims.ts/compare/v0.1.9...v0.1.10) (2022-02-16)


### Features

* isValidClaimString ([12639c6](https://github.com/eturino/claims.ts/commit/12639c69c07d838705ec01c1ac414c823f177b91))

### [0.1.9](https://github.com/eturino/claims.ts/compare/v0.1.8...v0.1.9) (2021-02-05)

### [0.1.8](https://github.com/eturino/claims.ts/compare/v0.1.7...v0.1.8) (2021-01-26)

### [0.1.7](https://github.com/eturino/claims.ts/compare/v0.1.6...v0.1.7) (2020-05-27)


### Features

* ability#accessToResources(query): KeySet<string> with access to children of given query ([b652775](https://github.com/eturino/claims.ts/commit/b65277529c565f0d0d9ba30b9d0b1b83695d5321))

### [0.1.6](https://github.com/eturino/claims.ts/compare/v0.1.5...v0.1.6) (2020-05-12)

### [0.1.5](https://github.com/eturino/claims.ts/compare/v0.1.4...v0.1.5) (2020-05-12)


### Bug Fixes

* target ES2017 instead of esnext for module, and ES2015 for main ([dee3c6d](https://github.com/eturino/claims.ts/commit/dee3c6dc869c2c7f9a9a28f4038027c20c4c9765))

### [0.1.4](https://github.com/eturino/claims.ts/compare/v0.1.3...v0.1.4) (2020-04-29)

### [0.1.3](https://github.com/eturino/claims.ts/compare/v0.1.2...v0.1.3) (2020-04-14)

### [0.1.2](https://github.com/eturino/claims.ts/compare/v0.1.1...v0.1.2) (2019-09-12)


### Features

* claim.toString() to return "verb:resource" or "verb:*" (also better docs) ([a86989c](https://github.com/eturino/claims.ts/commit/a86989c))

### [0.1.1](https://github.com/eturino/claims.ts/compare/v0.1.0...v0.1.1) (2019-09-09)


### Bug Fixes

* exporting all needed data + refactor ([12b1a63](https://github.com/eturino/claims.ts/commit/12b1a63))

## 0.1.0 (2019-09-09)
