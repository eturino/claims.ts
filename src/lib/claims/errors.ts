import { ALLOWED_VERBS } from "./rules";

/**
 * Error thrown when a claim is not valid because the verb is not an allowed one.
 */
export class InvalidVerbError extends Error {
  constructor(readonly verb: string) {
    super(`the given verb '${verb}' is not one of the allowed verbs: ${JSON.stringify(ALLOWED_VERBS)}`);
  }
}

/**
 * Error thrown when a claim is not valid because the pattern cannot be parsed as a Claim.
 */
export class InvalidPatternError extends Error {
  constructor(readonly raw: string) {
    super(`the given raw string cannot be parsed as a claim ${JSON.stringify(raw)}`);
  }
}

/**
 * Error thrown when trying to alter a frozen claimSet.
 */
export class FrozenClaimSetError extends Error {}
