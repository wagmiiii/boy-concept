// A projects entry stores its poster as a path string (media/x.webp, under src/assets), because a
// YAML file cannot hold an Astro image reference and a CMS has to be able to write it as text
// (ARCH section 5). Astro's image pipeline needs the module itself, so this is the one lookup that
// joins the two.
import type { ImageMetadata } from "astro";

const images = import.meta.glob("./assets/media/*.{webp,avif,jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, ImageMetadata>;

/**
 * The optimized image for a stored poster path.
 * @param path the entry's poster field, relative to `web/src/assets`
 * @returns the image metadata, or undefined when the file is not there, which renders the frame
 *   without a poster rather than a broken image
 */
export function posterFor(path: string): ImageMetadata | undefined {
  return images[`./assets/${path}`];
}
