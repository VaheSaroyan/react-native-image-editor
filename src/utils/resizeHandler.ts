import { imgResizer } from './imgResizer';
import { Image, View } from 'react-native';
import type { RefObject } from 'react';

export const resizeHandler = (
  ref: RefObject<View>,
  setSize: ({ height, width }: { height: number; width: number }) => void,
  img: string
): void => {
  ref.current?.measure(
    (
      fx: number,
      fy: number,
      width: number,
      height: number,
      px: number,
      py: number
    ): void => {
      Image.getSize(img, (w: number, h: number): void => {
        const size = imgResizer({
          height: h,
          width: w,
          measure: { fx, fy, width, height, px, py },
        });
        setSize(size);
      });
    }
  );
};
