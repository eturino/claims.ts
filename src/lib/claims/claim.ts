import has from "lodash.has";
import isObject from "lodash.isobject";
import isString from "lodash.isstring";

const CLAIM_REGEX = /^([\w_\-]+):([\w_.\-]+\w)(\.\*)?$/; // allows for the optional `.*` at the end, that will be ignored on the Claim creation
const GLOBAL_WILDCARD_CLAIM_REGEX = /^([\w_\-]+):\*$/; // cater for `read:*` global claims
// const QUERY_RESOURCE_REGEX = /^([\w_.\-]+\w)(\.\*)?$/; // allows for the optional `.*` at the end, that will be ignored on the Claim creation

/**
 * allowed verbs for a Claim
 */
export const ALLOWED_VERBS = ["admin", "read"];

/**
 * given a verb, it throws an error if it is not one of the allowed ones.
 *
 * @param verb
 */
function checkVerb(verb: string): void {
  if (ALLOWED_VERBS.includes(verb)) return;

  throw new Error(`the verb is not one of the allowed verbs: ${ALLOWED_VERBS}`);
}

export interface IClaimData {
  verb: string;
  resource: string | null;
}

function extractFromString(s: string): IClaimData {
  const globalMatch = GLOBAL_WILDCARD_CLAIM_REGEX.exec(s);
  if (globalMatch) {
    checkVerb(globalMatch[1]);
    return { verb: globalMatch[1], resource: null };
  }

  const resourceMatch = CLAIM_REGEX.exec(s);
  if (resourceMatch) {
    checkVerb(resourceMatch[1]);
    return { verb: resourceMatch[1], resource: resourceMatch[2] };
  }

  throw new Error("cannot recognise verb and resource, it is neither `verb:*` or `verb:some.resource`");
}

export function extractVerbResource(stringOrData: string | IClaimData | Claim): IClaimData {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  if (stringOrData instanceof Claim) {
    return { verb: stringOrData.verb, resource: stringOrData.resource };
  }

  if (isString(stringOrData)) {
    return extractFromString(stringOrData);
  }

  if (isObject(stringOrData) && has(stringOrData, "verb")) {
    return { verb: stringOrData.verb, resource: stringOrData.resource || null };
  }

  throw new Error(
    "cannot recognise verb and resource, it is neither `verb:*` or `verb:some.resource` string or an object with `verb` and `resource`"
  );
}

export function partsFromResource(resource: string | null): string[] {
  if (!resource) return [];
  return resource.split(".");
}

export class Claim {
  private get resourceParts(): string[] {
    if (!this._resourceParts) {
      this._resourceParts = partsFromResource(this.resource);
    }
    return this._resourceParts;
  }
  public readonly verb: string;
  public readonly resource: string | null;

  private _resourceParts: string[] | null = null;

  constructor({ verb, resource }: IClaimData) {
    checkVerb(verb);
    this.verb = verb;
    this.resource = resource;
  }

  /**
   * returns `verb:resource` (if global, it will return `verb:*`)
   */
  public toString(): string {
    return `${this.verb}:${this.resource || "*"}`;
  }

  /**
   * true if the given verb is the same as the claim's
   * @param verb
   */
  public hasVerb(verb: string): boolean {
    return this.verb === verb;
  }

  /**
   * true if the claim has no resource (global verb). This means that it represents all resources for this verb
   */
  public isGlobal(): boolean {
    return !this.resource;
  }

  /**
   * returns true if this claim includes the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  public check(query: string | IClaimData): boolean {
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
  public isExact(query: string | IClaimData): boolean {
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
  public directChild(query: string | IClaimData): string | null {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectChild(verb, resource);
  }

  /**
   * return true if directChild() does not return null
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see directChild
   */
  public isDirectChild(query: string | IClaimData): boolean {
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
  public directDescendant(query: string | IClaimData): string | null {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectDescendant(verb, resource);
  }

  /**
   * return true if isDirectDescendant() does not return null
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see isDirectDescendant
   */
  public isDirectDescendant(query: string | IClaimData): boolean {
    return !!this.directDescendant(query);
  }

  private lookupDirectChild(verb: string, resource: string | null): string | null {
    if (!this.resource || !this.hasVerb(verb)) return null;

    const resourceParts = partsFromResource(resource);
    if (this.resourceParts.length !== resourceParts.length + 1) return null;

    if (!resource) return this.resourceParts[0];

    if (!this.resource.startsWith(`${resource}.`)) return null;
    return `${this.resource}`.replace(`${resource}.`, "");
  }

  private lookupDirectDescendant(verb: string, resource: string | null): string | null {
    if (!this.resource || !this.hasVerb(verb)) return null;

    if (!resource) return this.resourceParts[0];

    if (!this.resource.startsWith(`${resource}.`)) return null;
    const index = partsFromResource(resource).length;
    return this.resourceParts[index];
  }
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
export function buildClaim(stringOrObject: string | IClaimData | Claim): Claim {
  return new Claim(extractVerbResource(stringOrObject));
}
