import { extractVerbResource } from "./claim";

/**
 * tries to parse the given string into a claim, and returns true if it is valid, false otherwise
 * @param str the given string to check
 */
export function isValidClaimString(str: string): boolean {
  try {
    extractVerbResource(str);
    return true;
  } catch (e) {
    return false;
  }
}
