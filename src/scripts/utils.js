/**
 * Converts the given URL path to an anchor string
 * by converting any forward slashes in the path to hyphens
 *
 * @param {string} urlPath - The URL path to be converted.
 * @return {string} The anchor string generated from the URL path.
 */
export function toAnchor(urlPath) {
  const str = urlPath.charAt(0) === "/" ? urlPath.substring(1) : urlPath;
  return str.trim().replace(/\//g, "-");
}

/**
 * Checks if the given anchor string ends with a dash
 *
 * @param {string} anchor - The anchor string to check.
 * @return {boolean} Returns true if the anchor ends with a dash, false otherwise.
 */
export function endsWithDash(anchor) {
  if (!anchor || typeof anchor !== "string") {
    return false;
  }
  return anchor.endsWith("-");
}
