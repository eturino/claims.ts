import { ALLOWED_VERBS } from "./rules";

export class InvalidVerbError extends Error {
  constructor(readonly verb: string) {
    super(`the given verb '${verb}' is not one of the allowed verbs: ${JSON.stringify(ALLOWED_VERBS)}`);
  }
}

export class InvalidPatternError extends Error {
  constructor(readonly raw: string) {
    super(`the given raw string cannot be parsed as a claim ${JSON.stringify(raw)}`);
  }
}
