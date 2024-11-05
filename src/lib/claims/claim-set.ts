import { compact, uniq } from "es-toolkit";
import { type Claim, type IClaimData, buildClaim, extractVerbResource } from "./claim";
import { FrozenClaimSetError } from "./errors";

export class ClaimSet {
  protected frozen: boolean;
  constructor(public readonly claims: Claim[]) {
    this.frozen = true;
  }

  protected _jsonString: string | null = null;
  /**
   * returns a string with the JSON representation of the claim set
   *
   * It is calculated only once and then memoized, but resets if the claimSet gets unfrozen
   */
  public toJSONString(): string {
    if (!this._jsonString) {
      this._jsonString = JSON.stringify(this.claims.map((x) => x.toString()));
    }

    return this._jsonString;
  }

  /**
   * returns a new ClaimSet with clones of the same claims
   */
  public clone(): ClaimSet {
    return new ClaimSet(this.claims.map((x) => x.clone()));
  }

  /**
   * disallow any changes to the claim set. Resets the JSON string
   */
  public freeze(): void {
    this._jsonString = null;
    this.frozen = true;
  }

  /**
   * allow changes to the claim set
   */
  public unfreeze(): void {
    this.frozen = false;
  }

  /**
   * returns True if the claim set does not allow any changes
   */
  public isFrozen(): boolean {
    return this.frozen;
  }

  /**
   * if the given claim is not `check` in the claim set already it will add it
   * @param claim
   */
  public addIfNotChecked(claim: string | IClaimData | Claim): void {
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
  public addIfNotExact(claim: string | IClaimData | Claim): void {
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
  public check(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return this.claims.some((claim: Claim) => claim.check(parsedQuery));
  }

  /**
   * returns true if any of the claims of the set returns true for the `hasExact()` of the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public hasExact(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return this.claims.some((claim: Claim) => claim.isExact(parsedQuery));
  }

  /**
   * collects from the claims of the set the result of `directChild()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public directChildren(query: string | IClaimData | Claim): string[] {
    return this.mapInClaims(query, (claim, parsedQuery) => claim.directChild(parsedQuery));
  }

  /**
   * collects from the claims of the set the result of `directDescendant()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public directDescendants(query: string | IClaimData | Claim): string[] {
    return this.mapInClaims(query, (claim, parsedQuery) => claim.directDescendant(parsedQuery));
  }

  private mapInClaims(
    query: string | IClaimData | Claim,
    fn: (claim: Claim, parsedQuery: IClaimData) => string | null,
  ): string[] {
    const parsedQuery = extractVerbResource(query);
    const list = this.claims.map((claim) => fn(claim, parsedQuery));
    return uniq(compact(list)).sort();
  }
}

/**
 * creates a new ClaimSet by calling `buildClaim()` on each element of the given list and assign that to a new `ClaimSet`
 * @param list each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see buildClaim
 * @see ClaimSet
 */
export function buildClaimSet(list: (string | IClaimData | Claim)[]): ClaimSet {
  const claims = list.map((s) => buildClaim(s)).sort();

  return new ClaimSet(claims);
}
