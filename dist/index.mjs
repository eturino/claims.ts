// src/lib/claims/ability.ts
import { all, some } from "@eturino/key-set";

// src/lib/claims/claim.ts
import { isPlainObject, isString } from "es-toolkit";

// src/lib/claims/rules.ts
var ALLOWED_VERBS = ["admin", "read", "delete", "create", "update", "manage"];
function isAllowedVerb(verb) {
  return ALLOWED_VERBS.includes(verb);
}

// src/lib/claims/errors.ts
var InvalidVerbError = class extends Error {
  constructor(verb) {
    super(`the given verb '${verb}' is not one of the allowed verbs: ${JSON.stringify(ALLOWED_VERBS)}`);
    this.verb = verb;
  }
};
var InvalidPatternError = class extends Error {
  constructor(raw) {
    super(`the given raw string cannot be parsed as a claim ${JSON.stringify(raw)}`);
    this.raw = raw;
  }
};
var FrozenClaimSetError = class extends Error {
};

// src/lib/claims/claim.ts
var CLAIM_REGEX = /^([\w_\-]+):([\w_.\-]+\w)(\.\*)?$/;
var GLOBAL_WILDCARD_CLAIM_REGEX = /^([\w_\-]+):\*$/;
function extractFromString(s) {
  const globalMatch = GLOBAL_WILDCARD_CLAIM_REGEX.exec(s);
  if (globalMatch) {
    const verb = globalMatch[1];
    if (!isAllowedVerb(verb)) {
      throw new InvalidVerbError(verb);
    }
    return { verb, resource: null };
  }
  const resourceMatch = CLAIM_REGEX.exec(s);
  if (resourceMatch) {
    const verb = resourceMatch[1];
    if (!isAllowedVerb(verb)) {
      throw new InvalidVerbError(verb);
    }
    const resource = resourceMatch[2];
    if (resource.includes("..")) {
      throw new InvalidPatternError(s);
    }
    return { verb, resource };
  }
  throw new InvalidPatternError(s);
}
function extractVerbResource(stringOrData) {
  if (stringOrData instanceof Claim) {
    return { verb: stringOrData.verb, resource: stringOrData.resource };
  }
  if (isString(stringOrData)) {
    return extractFromString(stringOrData);
  }
  if (isPlainObject(stringOrData) && "verb" in stringOrData) {
    return { verb: stringOrData.verb, resource: stringOrData.resource || null };
  }
  throw new Error(
    "cannot recognise verb and resource, it is neither `verb:*` or `verb:some.resource` string or an object with `verb` and `resource`"
  );
}
function partsFromResource(resource) {
  if (!resource) return [];
  return resource.split(".");
}
var Claim = class _Claim {
  get resourceParts() {
    if (!this._resourceParts) {
      this._resourceParts = partsFromResource(this.resource);
    }
    return this._resourceParts;
  }
  verb;
  resource;
  _resourceParts = null;
  constructor({ verb, resource }) {
    if (!isAllowedVerb(verb)) {
      throw new InvalidVerbError(verb);
    }
    this.verb = verb;
    this.resource = resource;
  }
  /**
   * returns a new Claim with the same data
   */
  clone() {
    return new _Claim({ verb: this.verb, resource: this.resource });
  }
  /**
   * returns `verb:resource` (if global, it will return `verb:*`)
   */
  toString() {
    return `${this.verb}:${this.resource || "*"}`;
  }
  /**
   * true if the given verb is the same as the claim's
   * @param verb
   */
  hasVerb(verb) {
    return this.verb === verb;
  }
  /**
   * true if the claim has no resource (global verb). This means that it represents all resources for this verb
   */
  isGlobal() {
    return !this.resource;
  }
  /**
   * returns true if this claim includes the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  check(query) {
    const { verb, resource } = extractVerbResource(query);
    if (this.verb !== verb) return false;
    if (this.isGlobal()) return true;
    if (!resource) return false;
    if (resource === this.resource) return true;
    return resource.startsWith(`${this.resource}.`);
  }
  /**
   * returns true if this claim represents exactly the same as the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  isExact(query) {
    const { verb, resource } = extractVerbResource(query);
    if (this.verb !== verb) return false;
    if (!resource) return this.isGlobal();
    return resource === this.resource;
  }
  /**
   * given a query, if this claim is a direct child of that query, it will return the immediate child part. Otherwise it returns null
   *
   * e.g.
   * ```js
   * const claim = buildClaim("read:what.some.stuff");
   * claim.directChild("admin:*") // => null
   * claim.directChild("read:*") // => null
   * claim.directChild("read:what") // => null
   * claim.directChild("read:what.some") // => "stuff"
   * claim.directChild("read:what.some.stuff") // => null
   * claim.directChild("read:what.some.stuff.blah") // => null
   * ```
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  directChild(query) {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectChild(verb, resource);
  }
  /**
   * return true if directChild() does not return null
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see directChild
   */
  isDirectChild(query) {
    return !!this.directChild(query);
  }
  /**
   * given a query, if this claim is a direct descendant of that query, it will return the immediate child part. Otherwise it returns null
   *
   * e.g.
   * ```js
   * claim.directDescendant("admin:*") // => null
   * claim.directDescendant("read:*") // => "what"
   * claim.directDescendant("read:what") // => "some"
   * claim.directDescendant("read:what.some") // => "stuff"
   * claim.directDescendant("read:what.some.stuff") // => null
   * claim.directDescendant("read:what.some.stuff.blah") // => null
   * ```
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  directDescendant(query) {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectDescendant(verb, resource);
  }
  /**
   * return true if isDirectDescendant() does not return null
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see isDirectDescendant
   */
  isDirectDescendant(query) {
    return !!this.directDescendant(query);
  }
  lookupDirectChild(verb, resource) {
    if (!this.resource || !this.hasVerb(verb)) return null;
    const resourceParts = partsFromResource(resource);
    if (this.resourceParts.length !== resourceParts.length + 1) return null;
    if (!resource) return this.resourceParts[0];
    if (!this.resource.startsWith(`${resource}.`)) return null;
    return `${this.resource}`.replace(`${resource}.`, "");
  }
  lookupDirectDescendant(verb, resource) {
    if (!this.resource || !this.hasVerb(verb)) return null;
    if (!resource) return this.resourceParts[0];
    if (!this.resource.startsWith(`${resource}.`)) return null;
    const index = partsFromResource(resource).length;
    return this.resourceParts[index];
  }
};
function buildClaim(stringOrObject) {
  return new Claim(extractVerbResource(stringOrObject));
}

// src/lib/claims/claim-set.ts
import { compact, uniq } from "es-toolkit";
var ClaimSet = class _ClaimSet {
  constructor(claims) {
    this.claims = claims;
    this.frozen = true;
  }
  frozen;
  _jsonString = null;
  /**
   * returns a string with the JSON representation of the claim set
   *
   * It is calculated only once and then memoized, but resets if the claimSet gets unfrozen
   */
  toJSONString() {
    if (!this._jsonString) {
      this._jsonString = JSON.stringify(this.claims.map((x) => x.toString()));
    }
    return this._jsonString;
  }
  /**
   * returns a new ClaimSet with clones of the same claims
   */
  clone() {
    return new _ClaimSet(this.claims.map((x) => x.clone()));
  }
  /**
   * disallow any changes to the claim set. Resets the JSON string
   */
  freeze() {
    this._jsonString = null;
    this.frozen = true;
  }
  /**
   * allow changes to the claim set
   */
  unfreeze() {
    this.frozen = false;
  }
  /**
   * returns True if the claim set does not allow any changes
   */
  isFrozen() {
    return this.frozen;
  }
  /**
   * if the given claim is not `check` in the claim set already it will add it
   * @param claim
   */
  addIfNotChecked(claim) {
    if (this.frozen) {
      throw new FrozenClaimSetError("ClaimSet is frozen");
    }
    if (!this.check(claim)) {
      this.claims.push(buildClaim(claim));
      this.claims.sort();
    }
  }
  /**
   * if the given claim is not `hasExact` in the claim set already it will add it
   * @param claim
   */
  addIfNotExact(claim) {
    if (this.frozen) {
      throw new FrozenClaimSetError("ClaimSet is frozen");
    }
    if (!this.hasExact(claim)) {
      this.claims.push(buildClaim(claim));
      this.claims.sort();
    }
  }
  /**
   * returns true if any of the claims of the set returns true for the `check()` of the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  check(query) {
    const parsedQuery = extractVerbResource(query);
    return this.claims.some((claim) => claim.check(parsedQuery));
  }
  /**
   * returns true if any of the claims of the set returns true for the `hasExact()` of the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  hasExact(query) {
    const parsedQuery = extractVerbResource(query);
    return this.claims.some((claim) => claim.isExact(parsedQuery));
  }
  /**
   * collects from the claims of the set the result of `directChild()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  directChildren(query) {
    return this.mapInClaims(query, (claim, parsedQuery) => claim.directChild(parsedQuery));
  }
  /**
   * collects from the claims of the set the result of `directDescendant()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  directDescendants(query) {
    return this.mapInClaims(query, (claim, parsedQuery) => claim.directDescendant(parsedQuery));
  }
  mapInClaims(query, fn) {
    const parsedQuery = extractVerbResource(query);
    const list = this.claims.map((claim) => fn(claim, parsedQuery));
    return uniq(compact(list)).sort();
  }
};
function buildClaimSet(list) {
  const claims = list.map((s) => buildClaim(s)).sort();
  return new ClaimSet(claims);
}

// src/lib/claims/ability.ts
var Ability = class _Ability {
  constructor(permitted, prohibited) {
    this.permitted = permitted;
    this.prohibited = prohibited;
  }
  /**
   Returns a new ability with clones with the claim sets
   */
  clone() {
    return new _Ability(this.permitted.clone(), this.prohibited.clone());
  }
  /**
   * returns a string with the permitted and prohibited jsons inside, for caching purposes
   */
  get cacheID() {
    return `(${this.permitted.toJSONString()},${this.prohibited.toJSONString()})`;
  }
  /**
   * inverse of `can()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   *
   * @see can
   */
  cannot(query) {
    return !this.can(query);
  }
  /**
   * return true if permitted is true and prohibited is false
   * - permitted -> if the permitted ClaimSet returns true on `check()` for the given query
   * - prohibited -> if the prohibited ClaimSet returns true on `check()` for the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see ClaimSet
   */
  can(query) {
    const parsedQuery = extractVerbResource(query);
    return this.permitted.check(parsedQuery) && !this.prohibited.check(parsedQuery);
  }
  /**
   * returns true if there is a prohibited claim that returns true on `check()`
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see ClaimSet
   * @see Claim
   */
  isExplicitlyProhibited(query) {
    return this.prohibited.check(query);
  }
  /**
   * returns a KeySet describing the access of this ability to the children of the given query:
   * allows on direct descendants, forbids on direct children
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  accessToResources(query) {
    const allowed = this.permitted.check(query) ? all() : some(this.permitted.directDescendants(query));
    const forbidden = this.prohibited.check(query) ? all() : some(this.prohibited.directChildren(query));
    return allowed.remove(forbidden);
  }
};
function buildAbility(permittedStrings, prohibitedStrings) {
  const permitted = buildClaimSet(permittedStrings);
  const prohibited = buildClaimSet(prohibitedStrings);
  return new Ability(permitted, prohibited);
}

// src/lib/claims/is-valid-claim-string.ts
function isValidClaimString(str) {
  try {
    extractVerbResource(str);
    return true;
  } catch (e) {
    return false;
  }
}
export {
  ALLOWED_VERBS,
  Ability,
  Claim,
  ClaimSet,
  FrozenClaimSetError,
  InvalidPatternError,
  InvalidVerbError,
  buildAbility,
  buildClaim,
  buildClaimSet,
  isAllowedVerb,
  isValidClaimString
};
//# sourceMappingURL=index.mjs.map