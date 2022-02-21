/**
 * allowed verbs for a Claim
 */
export const ALLOWED_VERBS = ["admin", "read"];

export type AllowedVerb = "admin" | "read";

/**
 * returns true if the given string is one of the allowed verbs
 * @param verb
 */
export function isAllowedVerb(verb: string): verb is AllowedVerb {
  return ALLOWED_VERBS.includes(verb);
}
