type Oklch = { l: number; c: number; h: number };

const OKLCH_PATTERN = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

export function parseOklch(value: string): Oklch {
  const match = OKLCH_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Not an oklch() color: ${value}`);
  }

  return { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) };
}

function encodeGamma(channel: number) {
  return channel <= 0.0031308
    ? channel * 12.92
    : 1.055 * channel ** (1 / 2.4) - 0.055;
}

function decodeGamma(channel: number) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

/**
 * Converts to the 8-bit sRGB a display actually shows, so out-of-gamut colors are clamped the same way
 * the browser clamps them, and then back to linear light for the luminance formula.
 */
function toLinearSrgb({ l, c, h }: Oklch) {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);

  const long = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ].map(channel => {
    const displayed =
      Math.round(Math.min(1, Math.max(0, encodeGamma(channel))) * 255) / 255;
    return decodeGamma(displayed);
  });
}

export function relativeLuminance(color: string) {
  const [red, green, blue] = toLinearSrgb(parseOklch(color));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string) {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

/** Reads the custom properties declared in one selector block of a stylesheet. */
export function readCustomProperties(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) {
    throw new Error(`No block found for selector ${selector}`);
  }

  const body = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start));
  const properties: Record<string, string> = {};

  for (const [, name, value] of body.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    properties[name] = value.trim();
  }

  return properties;
}
