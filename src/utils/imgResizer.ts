export const imgResizer = (imageRealSize: {
  measure: { width: number; height: number };
  width: number;
  height: number;
}): { height: number; width: number } => {
  const { height, width, measure } = imageRealSize;
  if (measure && height > width && height > measure.height) {
    const proportions = height / measure.height;
    if (width / proportions > measure.width) {
      const miniProportions = height / width;
      return { height: measure.width * miniProportions, width: measure.width };
    }
    return { height: measure.height, width: width / proportions };
  }
  if (measure && height > width && height < measure.height) {
    const proportions = measure.height / height;
    if (width * proportions > measure.width) {
      const miniProportions = height / width;
      return { height: measure.width * miniProportions, width: measure.width };
    }
    return { height: measure.height, width: width * proportions };
  }
  if (measure && height < width && width > measure.width) {
    const proportions = width / measure.width;
    return { height: height / proportions, width: measure.width };
  }
  if (measure && height < width && width < measure.width) {
    const proportions = measure.width / width;
    return { height: height * proportions, width: measure.width };
  }
  if (measure && height === width && measure.height > measure.width) {
    return { height: measure.width, width: measure.width };
  }
  if (measure && height === width && measure.height < measure.width) {
    return { height: measure.height, width: measure.height };
  }
  return { height, width };
};
