import Image, { type ImageProps } from "next/image";

/**
 * Wrapper around next/image. Local SVG placeholders are served unoptimized;
 * raster images (real product photography) go through the image optimizer.
 */
export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  // eslint-disable-next-line jsx-a11y/alt-text -- alt is passed through props
  return <Image {...props} unoptimized={props.unoptimized ?? src.endsWith(".svg")} />;
}
