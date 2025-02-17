import { KeySet } from '@eturino/key-set';

/**
 * allowed verbs for a Claim
 */
declare const ALLOWED_VERBS: readonly ["admin", "read", "delete", "create", "update", "manage"];
/**
 * allowed verbs for a Claim
 */
type AllowedVerb = (typeof ALLOWED_VERBS)[number];
/**
 * returns true if the given string is one of the allowed verbs
 * @param verb
 */
declare function isAllowedVerb(verb: string): verb is AllowedVerb;

interface IClaimData {
    verb: AllowedVerb;
    resource: string | null;
}
declare class Claim {
    private get resourceParts();
    readonly verb: AllowedVerb;
    readonly resource: string | null;
    private _resourceParts;
    constructor({ verb, resource }: IClaimData | Readonly<IClaimData>);
    /**
     * returns a new Claim with the same data
     */
    clone(): Claim;
    /**
     * returns `verb:resource` (if global, it will return `verb:*`)
     */
    toString(): string;
    /**
     * true if the given verb is the same as the claim's
     * @param verb
     */
    hasVerb(verb: string): boolean;
    /**
     * true if the claim has no resource (global verb). This means that it represents all resources for this verb
     */
    isGlobal(): boolean;
    /**
     * returns true if this claim includes the given query
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     */
    check(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): boolean;
    /**
     * returns true if this claim represents exactly the same as the given query
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     */
    isExact(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): boolean;
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
    directChild(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): string | null;
    /**
     * return true if directChild() does not return null
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see directChild
     */
    isDirectChild(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): boolean;
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
    directDescendant(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): string | null;
    /**
     * return true if isDirectDescendant() does not return null
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see isDirectDescendant
     */
    isDirectDescendant(query: string | IClaimData | Readonly<IClaimData> | Claim | Readonly<Claim>): boolean;
    private lookupDirectChild;
    private lookupDirectDescendant;
}
/**
 * creates a new `Claim` object with the info given
 *
 * it validates the verb is one of the valid verbs
 *
 * @param stringOrObject can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see ALLOWED_VERBS
 * @see Claim
 */
declare function buildClaim(stringOrObject: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): Claim;

declare class ClaimSet {
    readonly claims: Claim[];
    protected frozen: boolean;
    constructor(claims: Claim[]);
    protected _jsonString: string | null;
    /**
     * returns a string with the JSON representation of the claim set
     *
     * It is calculated only once and then memoized, but resets if the claimSet gets unfrozen
     */
    toJSONString(): string;
    /**
     * returns a new ClaimSet with clones of the same claims
     */
    clone(): ClaimSet;
    /**
     * disallow any changes to the claim set. Resets the JSON string
     */
    freeze(): void;
    /**
     * allow changes to the claim set
     */
    unfreeze(): void;
    /**
     * returns True if the claim set does not allow any changes
     */
    isFrozen(): boolean;
    /**
     * if the given claim is not `check` in the claim set already it will add it
     * @param claim
     */
    addIfNotChecked(claim: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): void;
    /**
     * if the given claim is not `hasExact` in the claim set already it will add it
     * @param claim
     */
    addIfNotExact(claim: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): void;
    /**
     * returns true if any of the claims of the set returns true for the `check()` of the given query
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see Claim
     */
    check(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): boolean;
    /**
     * returns true if any of the claims of the set returns true for the `hasExact()` of the given query
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see Claim
     */
    hasExact(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): boolean;
    /**
     * collects from the claims of the set the result of `directChild()`
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see Claim
     */
    directChildren(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): string[];
    /**
     * collects from the claims of the set the result of `directDescendant()`
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see Claim
     */
    directDescendants(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): string[];
    private mapInClaims;
}
/**
 * creates a new ClaimSet by calling `buildClaim()` on each element of the given list and assign that to a new `ClaimSet`
 * @param list each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see buildClaim
 * @see ClaimSet
 */
declare function buildClaimSet(list: readonly (string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>)[]): ClaimSet;

declare class Ability {
    readonly permitted: ClaimSet;
    readonly prohibited: ClaimSet;
    constructor(permitted: ClaimSet, prohibited: ClaimSet);
    /**
     Returns a new ability with clones with the claim sets
     */
    clone(): Ability;
    /**
     * returns a string with the permitted and prohibited jsons inside, for caching purposes
     */
    get cacheID(): string;
    /**
     * inverse of `can()`
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     *
     * @see can
     */
    cannot(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): boolean;
    /**
     * return true if permitted is true and prohibited is false
     * - permitted -> if the permitted ClaimSet returns true on `check()` for the given query
     * - prohibited -> if the prohibited ClaimSet returns true on `check()` for the given query
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see ClaimSet
     */
    can(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): boolean;
    /**
     * returns true if there is a prohibited claim that returns true on `check()`
     *
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     * @see ClaimSet
     * @see Claim
     */
    isExplicitlyProhibited(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): boolean;
    /**
     * returns a KeySet describing the access of this ability to the children of the given query:
     * allows on direct descendants, forbids on direct children
     * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
     */
    accessToResources(query: string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>): KeySet<string>;
}
/**
 *
 * @param permittedStrings each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @param prohibitedStrings each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see buildClaimSet
 * @see Ability
 */
declare function buildAbility(permittedStrings: readonly (string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>)[], prohibitedStrings: readonly (string | IClaimData | Claim | Readonly<IClaimData> | Readonly<Claim>)[]): Ability;

/**
 * Error thrown when a claim is not valid because the verb is not an allowed one.
 */
declare class InvalidVerbError extends Error {
    readonly verb: string;
    constructor(verb: string);
}
/**
 * Error thrown when a claim is not valid because the pattern cannot be parsed as a Claim.
 */
declare class InvalidPatternError extends Error {
    readonly raw: string;
    constructor(raw: string);
}
/**
 * Error thrown when trying to alter a frozen claimSet.
 */
declare class FrozenClaimSetError extends Error {
}

/**
 * tries to parse the given string into a claim, and returns true if it is valid, false otherwise
 * @param str the given string to check
 */
declare function isValidClaimString(str: string): boolean;

export { ALLOWED_VERBS, Ability, type AllowedVerb, Claim, ClaimSet, FrozenClaimSetError, type IClaimData, InvalidPatternError, InvalidVerbError, buildAbility, buildClaim, buildClaimSet, isAllowedVerb, isValidClaimString };
