/**
 * allowed verbs for a Claim
 */
export const ALLOWED_VERBS = ["admin", "read", "delete", "create", "update", "manage"] as const;

/**
 * allowed verbs for a Claim
 */
export type AllowedVerb = (typeof ALLOWED_VERBS)[number];

/**
 * returns true if the given string is one of the allowed verbs
 * @param verb
 */
export function isAllowedVerb(verb: string): verb is AllowedVerb {
  return ALLOWED_VERBS.includes(verb as AllowedVerb);
}
