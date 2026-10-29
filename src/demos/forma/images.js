// These sizes follow the shell and card breakpoints in styles.css. The full
// original remains available to the lightbox; ordinary pages load a smaller file.
export const FULL_IMAGE_SIZES = [
  "(min-width: 1700px) 1540px",
  "(min-width: 1512px) 1400px",
  "(min-width: 1151px) calc(100vw - 112px)",
  "(min-width: 801px) calc(100vw - 76px)",
  "(min-width: 561px) calc(100vw - 44px)",
  "(min-width: 361px) calc(100vw - 36px)",
  "calc(100vw - 32px)",
].join(", ");
export const CARD_IMAGE_SIZES = [
  "(min-width: 1700px) 751px",
  "(min-width: 1512px) 681px",
  "(min-width: 1151px) calc(50vw - 75px)",
  "(min-width: 801px) calc(50vw - 57px)",
  "(min-width: 561px) calc(50vw - 34.5px)",
  "(min-width: 361px) calc(100vw - 36px)",
  "calc(100vw - 32px)",
].join(", ");
export const FEATURED_IMAGE_SIZES = [
  "(min-width: 1700px) 1109px",
  "(min-width: 1512px) 1008px",
  "(min-width: 1151px) calc(72vw - 80.64px)",
  "(min-width: 801px) calc(72vw - 54.72px)",
  "(min-width: 561px) calc(80vw - 35.2px)",
  "(min-width: 361px) calc(100vw - 36px)",
  "calc(100vw - 32px)",
].join(", ");
export function responsiveImage(project, sizes = FULL_IMAGE_SIZES) {
  const stem = project.image.replace(/\.webp$/, "");
  return {
    src: `${stem}-1024.webp`,
    srcSet: [640, 1024, 1280, 1536]
      .map((width) => `${stem}-${width}.webp ${width}w`)
      .join(", "),
    sizes,
    decoding: "async",
  };
}
