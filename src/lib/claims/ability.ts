import { Claim, extractVerbResource, IClaimData } from "./claim";
import { buildClaimSet, ClaimSet } from "./claim-set";

export class Ability {
  constructor(
    public readonly permitted: ClaimSet,
    public readonly prohibited: ClaimSet
  ) {}

  /**
   * inverse of `can()`
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   *
   * @see can
   */
  public cannot(query: string | IClaimData | Claim): boolean {
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
  public can(query: string | IClaimData | Claim): boolean {
    const parsedQuery = extractVerbResource(query);
    return (
      this.permitted.check(parsedQuery) && !this.prohibited.check(parsedQuery)
    );
  }

  /**
   * returns true if there is a prohibited claim that returns true on `check()`
   *
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   * @see ClaimSet
   * @see Claim
   */
  public isExplicitlyProhibited(query: string | IClaimData | Claim): boolean {
    return this.prohibited.check(query);
  }
}

/**
 *
 * @param permittedStrings each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @param prohibitedStrings each element can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
 * @see buildClaimSet
 * @see Ability
 */
export function buildAbility(
  permittedStrings: Array<string | IClaimData | Claim>,
  prohibitedStrings: Array<string | IClaimData | Claim>
): Ability {
  const permitted = buildClaimSet(permittedStrings);
  const prohibited = buildClaimSet(prohibitedStrings);

  return new Ability(permitted, prohibited);
}
