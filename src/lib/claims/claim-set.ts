import compact from "lodash.compact";
import map from "lodash.map";
import some from "lodash.some";
import uniq from "lodash.uniq";

import Claim, { buildClaim, extractVerbResource, IClaimData } from "./claim";

export default class ClaimSet {
  constructor(public readonly claims: Claim[]) {}

  public check(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return some(this.claims, (claim: Claim) => claim.check(parsedQuery));
  }

  public directChildren(query: string | IClaimData | Claim): string[] {
    const parsedQuery = extractVerbResource(query);
    const list = map(this.claims, claim => claim.directChild(parsedQuery));
    return uniq(compact(list)).sort();
  }

  public directDescendants(query: string | IClaimData | Claim): string[] {
    const parsedQuery = extractVerbResource(query);
    const list = map(this.claims, claim => claim.directDescendant(parsedQuery));
    return uniq(compact(list)).sort();
  }
}

export function buildClaimSet(
  strings: Array<string | IClaimData | Claim>
): ClaimSet {
  const claims = strings.map(s => buildClaim(s));

  return new ClaimSet(claims);
}
