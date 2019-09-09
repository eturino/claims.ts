import has from "lodash.has";
import isObject from "lodash.isobject";
import isString from "lodash.isstring";

const CLAIM_REGEX = /^([\w_\-]+):([\w_.\-]+\w)(\.\*)?$/; // allows for the optional `.*` at the end, that will be ignored on the Claim creation
const GLOBAL_WILDCARD_CLAIM_REGEX = /^([\w_\-]+):\*$/; // cater for `read:*` global claims
// const QUERY_RESOURCE_REGEX = /^([\w_.\-]+\w)(\.\*)?$/; // allows for the optional `.*` at the end, that will be ignored on the Claim creation

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

  throw new Error(
    "cannot recognise verb and resource, it is neither `verb:*` or `verb:some.resource`"
  );
}

export function extractVerbResource(
  stringOrData: string | IClaimData | Claim
): IClaimData {
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

export default class Claim {
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

  public hasVerb(verb: string): boolean {
    return this.verb === verb;
  }

  public isGlobal(): boolean {
    return !this.resource;
  }

  public check(query: string | IClaimData): boolean {
    const { verb, resource } = extractVerbResource(query);
    if (this.verb !== verb) return false;

    if (this.isGlobal()) return true;

    if (!resource) return false;

    if (resource === this.resource) return true;

    return resource.startsWith(`${this.resource}.`);
  }

  public isExact(query: string | IClaimData): boolean {
    const { verb, resource } = extractVerbResource(query);
    if (this.verb !== verb) return false;
    if (!resource) return this.isGlobal();
    return resource === this.resource;
  }

  public directChild(query: string | IClaimData): string | null {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectChild(verb, resource);
  }

  public isDirectChild(query: string | IClaimData): boolean {
    return !!this.directChild(query);
  }

  public directDescendant(query: string | IClaimData): string | null {
    const { verb, resource } = extractVerbResource(query);
    return this.lookupDirectDescendant(verb, resource);
  }

  public isDirectDescendant(query: string | IClaimData): boolean {
    return !!this.directDescendant(query);
  }

  private lookupDirectChild(
    verb: string,
    resource: string | null
  ): string | null {
    if (!this.resource) return null;
    if (!this.hasVerb(verb)) return null;

    const resourceParts = partsFromResource(resource);
    if (this.resourceParts.length !== resourceParts.length + 1) return null;

    if (!resource) return this.resourceParts[0];

    if (!this.resource.startsWith(`${resource}.`)) return null;
    return `${this.resource}`.replace(`${resource}.`, "");
  }

  private lookupDirectDescendant(
    verb: string,
    resource: string | null
  ): string | null {
    if (!this.resource) return null;
    if (!this.hasVerb(verb)) return null;

    if (!resource) return this.resourceParts[0];

    if (!this.resource.startsWith(`${resource}.`)) return null;
    const index = partsFromResource(resource).length;
    return this.resourceParts[index];
  }
}

export function buildClaim(stringOrObject: string | IClaimData | Claim): Claim {
  return new Claim(extractVerbResource(stringOrObject));
}
