import { Parser, Validator } from "collit";
import { isString } from "lodash/fp";

// red, green, and blue coefficients
// From https://github.com/tmcw/relative-luminance/blob/master/index.js
const rc = 0.2126;
const gc = 0.7152;
const bc = 0.0722;
// low-gamma adjust coefficient
const lowc = 1 / 12.92;

// From https://github.com/tmcw/relative-luminance/blob/master/index.js
function adjustGamma(_) {
  return Math.pow((_ + 0.055) / 1.055, 2.4);
}

/**
 * Given a 3-element array of R, G, B varying from 0 to 255, return the luminance
 * as a number from 0 to 1.
 * @param {Array<number>} rgb 3-element array of a color
 * @returns {number} luminance, between 0 and 1
 * @example
 * var luminance = require('relative-luminance');
 * var black_lum = luminance([0, 0, 0]); //
 *
 * From https://github.com/tmcw/relative-luminance/blob/master/index.js
 */
function relativeLuminance(rgb) {
  const rsrgb = rgb[0] / 255;
  const gsrgb = rgb[1] / 255;
  const bsrgb = rgb[2] / 255;

  const r = rsrgb <= 0.03928 ? rsrgb * lowc : adjustGamma(rsrgb);
  const g = gsrgb <= 0.03928 ? gsrgb * lowc : adjustGamma(gsrgb);
  const b = bsrgb <= 0.03928 ? bsrgb * lowc : adjustGamma(bsrgb);

  return r * rc + g * gc + b * bc;
}

const whiteRelLuminance = 1;
const blackRelLuminance = 0;

export function isValidColor(color) {
  return isString(color) && Validator.isColor(color);
}

export function normalizeHex(hex) {
  return hex.length === 7 ? hex : hex + hex.slice(-3);
}

// see https://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
// (L1 + 0.05) / (L2 + 0.05)
export function relLuminancesContrast(relLuminanceLighter, relLuminanceDarker) {
  return (relLuminanceLighter + 0.05) / (relLuminanceDarker + 0.05);
}

export function relLuminance(color) {
  const { r, g, b } = Parser.parseColor(color).rgb;
  return relativeLuminance([r, g, b]);
}

export function contrast(foregroundColor, backgroundColor) {
  const foregroundColorRelLuminance = relLuminance(foregroundColor);
  const backgroundColorRelLuminance = relLuminance(backgroundColor);
  return relLuminancesContrast(
    Math.max(foregroundColorRelLuminance, backgroundColorRelLuminance),
    Math.min(foregroundColorRelLuminance, backgroundColorRelLuminance)
  );
}

export function foreground(backgroundColor) {
  const backgroundColorRelLuminance = relLuminance(backgroundColor);
  return relLuminancesContrast(backgroundColorRelLuminance, blackRelLuminance) >
    relLuminancesContrast(whiteRelLuminance, backgroundColorRelLuminance)
    ? "black"
    : "white";
}
