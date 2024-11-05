# Claims (typescript)

[![npm version](https://badge.fury.io/js/%40eturino%2Fclaims.svg)](https://badge.fury.io/js/%40eturino%2Fclaims)
[![Maintainability](https://api.codeclimate.com/v1/badges/a705d5a15d65e2a70a9a/maintainability)](https://codeclimate.com/github/eturino/claims.ts/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a705d5a15d65e2a70a9a/test_coverage)](https://codeclimate.com/github/eturino/claims.ts/test_coverage)

[TypeDoc generated docs in here](https://eturino.github.io/claims.ts)

[Github repo here](https://github.com/eturino/claims.ts)

Library to encapsulate Claims (`"verb:resource"`) as well as ClaimSet (set of Claims) and Ability (permitted ClaimSet + prohibited ClaimSet).

TBD

(TypeScript port of <https://github.com/eturino/claims>)

Library bootstrapped using [typescript-starter](https://github.com/bitjson/typescript-starter).

## Installation

`yarn add @eturino/claims` or `npm install @eturino/claims`.

## Usage

Allowed verbs: "admin", "read", "delete", "create", "update", "manage".

see the [type docs](https://eturino.github.io/claims.ts) for now

instantiating the object using the `buildClaim()`, `buildClaimSet()` and `buildAbility()` functions is recommended

## Collaborators

- [Eduardo Turiño](https://github.com/eturino)
- [Drew Neil](https://github.com/nelstrom)
