import { Claim, extractVerbResource, IClaimData } from "./claim";
import { buildClaimSet, ClaimSet } from "./claim-set";

export class Ability {
  constructor(
    public readonly permitted: ClaimSet,
    public readonly prohibited: ClaimSet
  ) {}

  public cannot(query: string | IClaimData | Claim): boolean {
    return !this.can(query);
  }

  public can(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return (
      this.permitted.check(parsedQuery) && !this.prohibited.check(parsedQuery)
    );
  }

  public isExplicitlyProhibited(query: string | IClaimData | Claim): boolean {
    return this.prohibited.check(query);
  }
}

export function buildAbility(
  permittedStrings: Array<string | IClaimData | Claim>,
  prohibitedStrings: Array<string | IClaimData | Claim>
): Ability {
  const permitted = buildClaimSet(permittedStrings);
  const prohibited = buildClaimSet(prohibitedStrings);

  return new Ability(permitted, prohibited);
}
