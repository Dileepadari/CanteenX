export const getPlaceholderImage = (seed?: string | number, width = 600, height = 400) => {
  const s = seed ?? Math.floor(Math.random() * 1000000);
  // Use picsum with a seed to get consistent random images per entity
  return `https://picsum.photos/seed/${encodeURIComponent(String(s))}/${width}/${height}`;
};

export const ensureImageSrc = (src: string | undefined | null, seed?: string | number, width = 600, height = 400) => {
  return src && src.length > 0 ? src : getPlaceholderImage(seed, width, height);
};
