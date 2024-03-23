import { EDITOR_HEIGHT, EDITOR_WIDTH } from './constants';

export const imgResizer = (
  height: number,
  width: number
): {
  height: number;
  width: number;
  proportion: number;
  vertical: number;
  horizontal: number;
} => {
  let p = 1;
  let vertical = 0;
  let horizontal = 0;

  if (height > width && height >= EDITOR_HEIGHT) {
    p = height / EDITOR_HEIGHT;
    if (width / p > EDITOR_WIDTH) {
      p = height / width;
      return {
        height: EDITOR_WIDTH * p,
        width: EDITOR_WIDTH,
        proportion: EDITOR_WIDTH / width,
        vertical: (EDITOR_HEIGHT - EDITOR_WIDTH * p) / 2,
        horizontal: 0,
      };
    }
    return {
      height: EDITOR_HEIGHT,
      width: width / p,
      proportion: p,
      vertical: 0,
      horizontal: (EDITOR_WIDTH - width / p) / 2,
    };
  }
  if (height > width && height < EDITOR_HEIGHT) {
    p = EDITOR_HEIGHT / height;
    if (width * p > EDITOR_WIDTH) {
      p = height / width;
      return {
        height: EDITOR_WIDTH * p,
        width: EDITOR_WIDTH,
        proportion: EDITOR_WIDTH / width,
        vertical: (EDITOR_HEIGHT - EDITOR_WIDTH * p) / 2,
        horizontal: 0,
      };
    }
    return {
      height: EDITOR_HEIGHT,
      width: width * p,
      proportion: p,
      vertical: 0,
      horizontal: (EDITOR_WIDTH - width * p) / 2,
    };
  }
  if (width > height && width >= EDITOR_WIDTH) {
    p = width / EDITOR_WIDTH;
    if (height / p > EDITOR_HEIGHT) {
      p = width / height;
      return {
        height: EDITOR_HEIGHT,
        width: EDITOR_HEIGHT * p,
        proportion: EDITOR_HEIGHT / height,
        vertical: 0,
        horizontal: (EDITOR_WIDTH - EDITOR_HEIGHT * p) / 2,
      };
    }
    return {
      height: height / p,
      width: EDITOR_WIDTH,
      proportion: p,
      vertical: (EDITOR_HEIGHT - height / p) / 2,
      horizontal: 0,
    };
  }
  if (width > height && width < EDITOR_WIDTH) {
    p = EDITOR_WIDTH / width;
    if (height / p > EDITOR_WIDTH) {
      p = width / height;
      return {
        height: EDITOR_HEIGHT,
        width: EDITOR_HEIGHT * p,
        proportion: EDITOR_HEIGHT / height,
        vertical: 0,
        horizontal: (EDITOR_WIDTH - EDITOR_HEIGHT * p) / 2,
      };
    }
    return {
      height: height * p,
      width: EDITOR_WIDTH,
      proportion: p,
      vertical: (EDITOR_HEIGHT - height * p) / 2,
      horizontal: 0,
    };
  }
  if (height === width && EDITOR_HEIGHT > EDITOR_WIDTH) {
    return {
      height: EDITOR_WIDTH,
      width: EDITOR_WIDTH,
      proportion: width / EDITOR_WIDTH,
      vertical: (EDITOR_HEIGHT - EDITOR_WIDTH) / 2,
      horizontal: 0,
    };
  }
  if (height === width && EDITOR_HEIGHT < EDITOR_WIDTH) {
    return {
      height: EDITOR_HEIGHT,
      width: EDITOR_HEIGHT,
      proportion: height / EDITOR_HEIGHT,
      vertical: 0,
      horizontal: (EDITOR_WIDTH - EDITOR_HEIGHT) / 2,
    };
  }
  return { height, width, proportion: p, vertical, horizontal };
};
