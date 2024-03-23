export type MeasureType = {
  fx: number;
  fy: number;
  width: number;
  height: number;
  px: number;
  py: number;
};
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const measureHandler = (
  ref: any,
  setMeasure: (measure: MeasureType) => void
): void => {
  ref.current?.measure(
    (
      fx: number,
      fy: number,
      width: number,
      height: number,
      px: number,
      py: number
    ) => {
      setMeasure({
        fx,
        fy,
        width,
        height,
        px,
        py,
      });
    }
  );
};
