import compact from "lodash.compact";
import map from "lodash.map";
import some from "lodash.some";
import uniq from "lodash.uniq";

import { buildClaim, Claim, extractVerbResource, IClaimData } from "./claim";

export class ClaimSet {
  constructor(public readonly claims: Claim[]) {}

  /**
   * returns true if any of the claims of the set returns true for the `check()` of the given query
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public check(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return some(this.claims, (claim: Claim) => claim.check(parsedQuery));
  }

  /**
   * collects from the claims of the set the result of `directChild()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public directChildren(query: string | IClaimData | Claim): string[] {
    return this.mapInClaims(query, (claim, parsedQuery) =>
      claim.directChild(parsedQuery)
    );
  }

  /**
   * collects from the claims of the set the result of `directDescendant()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see Claim
   */
  public directDescendants(query: string | IClaimData | Claim): string[] {
    return this.mapInClaims(query, (claim, parsedQuery) =>
      claim.directDescendant(parsedQuery)
    );
  }

  private mapInClaims(
    query: string | IClaimData | Claim,
    fn: (claim: Claim, parsedQuery: IClaimData) => string | null
  ): string[] {
    const parsedQuery = extractVerbResource(query);
    const list = map(this.claims, claim => fn(claim, parsedQuery));
    return uniq(compact(list)).sort();
  }
}

/**
 * creates a new ClaimSet by calling `buildClaim()` on each element of the given list and assign that to a new `ClaimSet`
 * @param list each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see buildClaim
 * @see ClaimSet
 */
export function buildClaimSet(
  list: Array<string | IClaimData | Claim>
): ClaimSet {
  const claims = list.map(s => buildClaim(s));

  return new ClaimSet(claims);
}
