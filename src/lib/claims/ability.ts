import { KeySet, all, some } from "@eturino/key-set";
import { Claim, extractVerbResource, IClaimData } from "./claim";
import { buildClaimSet, ClaimSet } from "./claim-set";

export class Ability {
  constructor(public readonly permitted: ClaimSet, public readonly prohibited: ClaimSet) {}

  /**
   Returns a new ability with clones with the claim sets
   */
  public clone(): Ability {
    return new Ability(this.permitted.clone(), this.prohibited.clone());
  }

  /**
   * returns a string with the permitted and prohibited jsons inside, for caching purposes
   */
  get cacheID(): string {
    return `(${this.permitted.toJSONString()},${this.prohibited.toJSONString()})`;
  }

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
    return this.permitted.check(parsedQuery) && !this.prohibited.check(parsedQuery);
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

  /**
   * returns a KeySet describing the access of this ability to the children of the given query:
   * allows on direct descendants, forbids on direct children
   * @param query can be a string ("verb:resource" or "verb:*") or an object with `verb` and `resource`
   */
  accessToResources(query: string | IClaimData | Claim): KeySet<string> {
    const allowed = this.permitted.check(query) ? all<string>() : some(this.permitted.directDescendants(query));
    const forbidden = this.prohibited.check(query) ? all<string>() : some(this.prohibited.directChildren(query));

    return allowed.remove(forbidden);
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
  permittedStrings: (string | IClaimData | Claim)[],
  prohibitedStrings: (string | IClaimData | Claim)[]
): Ability {
  const permitted = buildClaimSet(permittedStrings);
  const prohibited = buildClaimSet(prohibitedStrings);

  return new Ability(permitted, prohibited);
}
