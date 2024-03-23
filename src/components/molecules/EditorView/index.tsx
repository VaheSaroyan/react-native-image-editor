import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import {
  Image,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  EDITOR_HEIGHT,
  EDITOR_WIDTH,
  SIZE_INSIDE_CROP_ITEMS,
} from '../../../utils/constants';
import type {
  aspectType,
  EditorSettingsType,
  SettingsType,
} from '../../organizm';
import FastImage from 'react-native-fast-image';
import { imgResizer } from '../../../utils/imgResizer';
import { images } from '../../../assets/images';
import { BackgroundFill } from '../BackgroundFill';
import { CropItems } from '../CropItems';

type imagesConfigsType = {
  img: string;
  count: number;
  settings: SettingsType[];
  editor: EditorSettingsType[];
};
type ScaleCtxType = {
  scale: number;
  rotate: number;
  aspect: number;
  trX: number;
};
type MoveCtxType = {
  transformX: number;
  transformY: number;
  crop: number;
  scale: number;
};
type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  selectedBtn: any;
  selectedAspect: aspectType | null;
  setSelectedAspect: (selectedAspect: aspectType | null) => void;
  counter: number;
  image: string;
  setInitialState: (state: any) => void;
  selectedIndex: number;
  imageSettings: imagesConfigsType['settings'];
  editorSettings: imagesConfigsType['editor'];
};
export type EditorRef = {
  crop: () => void;
  palette: (pal: { color: string; width: number } | null) => void;
  reset: () => void;
  rotate: () => void;
  redo: () => void;
  undo: () => void;
  aspect: (asp: aspectType | null) => void;
  flip: (flip: boolean, type: 'horizontal' | 'vertical') => void;
};
const enum SelectedBtnType {
  CROP = 'Crop',
}
export const EditorView = forwardRef<EditorRef, Props>(
  (
    {
      styleContainer,
      selectedBtn,
      selectedAspect,
      setSelectedAspect,
      counter,
      image,
      setInitialState,
      selectedIndex,
      imageSettings,
      editorSettings,
    },
    ref
  ) => {
    const MAX_SCALE = 12;
    const [fakeCounter, setFakeCounter] = useState(0);
    const [cropStarted, setCropStarted] = useState(false);
    const [transformStarted, setTransformStarted] = useState(false);
    const transformX = useSharedValue(0);
    const transformY = useSharedValue(0);
    const scl = useSharedValue(1);
    const rot = useSharedValue(0);
    const top = useSharedValue(0);
    const bottom = useSharedValue(0);
    const left = useSharedValue(0);
    const right = useSharedValue(0);
    const imgHeight = useSharedValue(0);
    const imgWidth = useSharedValue(0);
    const aspect = useSharedValue(0);
    const crop = useSharedValue(0);

    const index = useSharedValue(0);
    const fingers = useSharedValue<number[]>([]);

    const horizontal = useSharedValue(0);
    const vertical = useSharedValue(0);
    const proportion = useSharedValue(0);
    const initProportion = useSharedValue(0);

    const minScale = useSharedValue(1);
    const aspectProportion = useSharedValue(1);

    const borderWidth = useSharedValue(0);
    const borderColor = useSharedValue(colors.transparent);

    const flipHorizontal = useSharedValue(1);
    const flipVertical = useSharedValue(1);
    useImperativeHandle(ref, () => ({
      crop: () => {},
      palette: (pal: { color: string; width: number } | null): void => {
        onPaletteHandler(pal);
      },
      reset: () => {
        onResetHandler();
      },
      rotate: () => {
        onRotateHandler();
      },
      redo: () => {
        onRedoHandler();
      },
      undo: () => {
        onUndoHandler();
      },
      aspect: (asp: aspectType | null): void => {
        onAspectHandler(asp);
      },
      flip: (flip: boolean, type: 'horizontal' | 'vertical'): void => {
        onFlipHandler(flip, type);
      },
    }));

    const sizeStyle = useAnimatedStyle(() => {
      return { height: imgHeight.value, width: imgWidth.value };
    });

    const resetEditor = (counter: number) => {
      if (editorSettings?.[counter]) {
        flipHorizontal.value = editorSettings[counter]?.flip.horizontal
          ? -1
          : 1;
        flipVertical.value = editorSettings[counter]?.flip.vertical ? -1 : 1;

        setSelectedAspect(editorSettings?.[counter]?.aspect ?? null);
        top.value = withTiming(editorSettings?.[counter]?.top ?? 0);
        bottom.value = withTiming(editorSettings?.[counter]?.bottom ?? 0);
        left.value = withTiming(editorSettings?.[counter]?.left ?? 0);
        right.value = withTiming(editorSettings?.[counter]?.right ?? 0);
        scl.value = editorSettings?.[counter]?.scale ?? 0;
        transformX.value = editorSettings?.[counter]?.x ?? 0;
        transformY.value = editorSettings?.[counter]?.y ?? 0;

        rot.value = editorSettings?.[counter]?.rotate ?? 0;
        horizontal.value = editorSettings?.[counter]?.left ?? 0;
        vertical.value = editorSettings?.[counter]?.top ?? 0;
        proportion.value = editorSettings?.[counter]?.proportion ?? 0;
        initProportion.value = editorSettings?.[0]?.proportion ?? 0;
        minScale.value = editorSettings?.[counter]?.minScale ?? 0;

        borderWidth.value = editorSettings?.[counter]?.border?.width || 0;
        borderColor.value =
          editorSettings?.[counter]?.border?.color || colors.transparent;

        if (editorSettings?.[counter]?.aspect) {
          setSelectedAspect(editorSettings?.[counter]?.aspect ?? null);
        }
      }
    };

    const onRedoHandler = () => {
      if (counter < imageSettings.length - 1) {
        setInitialState((prev: any) => {
          resetEditor(prev[selectedIndex]?.count + 1);
          return {
            ...prev,
            [selectedIndex]: {
              ...prev[selectedIndex],
              count: prev[selectedIndex]?.count + 1,
            },
          };
        });
      }
    };

    const onUndoHandler = () => {
      if (counter > 0) {
        setInitialState((prev: any) => {
          resetEditor(prev[selectedIndex]?.count - 1);
          return {
            ...prev,
            [selectedIndex]: {
              ...prev[selectedIndex],
              count: prev[selectedIndex]?.count - 1,
            },
          };
        });
      }
    };

    const onResetHandler = () => {
      resetEditor(0);
      setInitialState((prev: any) => ({
        ...prev,
        [selectedIndex]: {
          ...prev[selectedIndex],
          count: 0,
          editor: [prev?.[selectedIndex]?.editor?.[0]],
          settings: [prev?.[selectedIndex]?.settings?.[0]],
        },
      }));
    };
    const onFlipHandler = (
      flip: boolean,
      type: 'horizontal' | 'vertical'
    ): void => {
      setInitialState((prev: any) => {
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        let x = prev[selectedIndex]?.settings[last]?.x,
          y = prev[selectedIndex]?.settings[last]?.y,
          trX = transformX.value,
          trY = transformY.value;
        let name = '';
        if (type === 'horizontal') {
          let width = prev[selectedIndex]?.settings[last]?.width;
          if (rot.value === 0 || rot.value === 3) {
            flipHorizontal.value = flip ? -1 : 1;
            width = prev[selectedIndex]?.settings[last]?.width;
            name = 'horizontal';
          }
          if (rot.value === 1.5 || rot.value === 4.5) {
            flipVertical.value = flip ? -1 : 1;
            width = prev[selectedIndex]?.settings[last]?.height;
            name = 'vertical';
          }
          transformX.value = -transformX.value;
          trX = trX * -1;
          const lastX = prev[selectedIndex]?.settings[last]?.x;
          const lastBW = prev[selectedIndex]?.settings[last]?.boxWidth;
          x = width - lastX - lastBW;
        }
        if (type === 'vertical') {
          let height = prev[selectedIndex]?.settings[last]?.height;
          if (rot.value === 0 || rot.value === 3) {
            flipVertical.value = flip ? -1 : 1;
            height = prev[selectedIndex]?.settings[last]?.height;
            name = 'vertical';
          }
          if (rot.value === 1.5 || rot.value === 4.5) {
            flipHorizontal.value = flip ? -1 : 1;
            height = prev[selectedIndex]?.settings[last]?.width;
            name = 'horizontal';
          }
          transformY.value = -transformY.value;
          trY = trY * -1;
          const lastY = prev[selectedIndex]?.settings[last]?.y;
          const lastBH = prev[selectedIndex]?.settings[last]?.boxHeight;
          y = height - lastY - lastBH;
        }

        return {
          ...prev,
          [selectedIndex]: {
            ...prev[selectedIndex],
            count: prev[selectedIndex]?.count + 1,
            editor: [
              ...prev[selectedIndex].editor.slice(
                0,
                prev[selectedIndex]?.count + 1
              ),
              {
                ...prev[selectedIndex].editor[last],
                x: trX,
                y: trY,
                flip: {
                  ...prev[selectedIndex].editor[last].flip,
                  [name]: flip,
                },
              },
            ],
            settings: [
              ...prev[selectedIndex].settings.slice(
                0,
                prev[selectedIndex]?.count + 1
              ),
              {
                ...prev[selectedIndex].settings[last],
                x,
                y,
              },
            ],
          },
        };
      });
    };
    const flipStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { scaleX: flipHorizontal.value },
          { scaleY: flipVertical.value },
        ],
      };
    });
    const onPaletteHandler = (
      palette: { color: string; width: number } | null
    ): void => {
      borderWidth.value = withTiming(palette?.width || 0);
      borderColor.value = palette?.color || colors.transparent;
      setInitialState((prev: any) => {
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        return {
          ...prev,
          [selectedIndex]: {
            ...prev[selectedIndex],
            count: prev[selectedIndex]?.count + 1,
            editor: [
              ...prev[selectedIndex].editor.slice(
                0,
                prev[selectedIndex]?.count + 1
              ),
              {
                ...prev[selectedIndex].editor[last],
                border: palette,
              },
            ],
            settings: [
              ...prev[selectedIndex].settings.slice(
                0,
                prev[selectedIndex]?.count + 1
              ),
              {
                ...prev[selectedIndex].settings[last],
                border: palette
                  ? `${palette.width}px solid ${palette.color}`
                  : '',
              },
            ],
          },
        };
      });
    };
    const borderStyle = useAnimatedStyle(() => {
      return {
        borderWidth: borderWidth.value,
        borderColor: borderColor.value,
      };
    });
    const onRotateHandler = () => {
      setInitialState((prev: any) => {
        let r = 0,
          vert = vertical.value,
          hor = horizontal.value,
          p = 1,
          mS = 0,
          x = 0,
          y = 0,
          eX,
          eY,
          boxHeight,
          boxWidth;
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        const height = prev[index.value].settings[last].height;
        const width = prev[index.value].settings[last].width;
        const lastBoxHeight = prev[index.value].settings[last].boxHeight;
        const lastBoxWidth = prev[index.value].settings[last].boxWidth;
        const lastX = prev[index.value].settings[last].x;
        const lastY = prev[index.value].settings[last].y;

        const lastEX = prev[index.value].editor[last].x;
        const lastEY = prev[index.value].editor[last].y;
        const lastScale = prev[index.value].editor[last].scale;

        if (!selectedAspect) {
          boxHeight = lastBoxWidth;
          boxWidth = lastBoxHeight;
        }
        const imgH = lastBoxHeight / initProportion.value;
        const imgW = lastBoxWidth / initProportion.value;

        if (!selectedAspect) {
          if (rot.value === 0 || rot.value === 3) {
            if (imgH >= imgW) {
              p = EDITOR_WIDTH / imgH;
              vert = (EDITOR_HEIGHT - imgW * p) / 2;
              hor = 0;
            } else {
              if (imgH / imgW > EDITOR_WIDTH / EDITOR_HEIGHT) {
                p = EDITOR_WIDTH / imgH;
                vert = (EDITOR_HEIGHT - imgW * p) / 2;
                hor = 0;
              } else {
                p = EDITOR_HEIGHT / imgW;
                vert = 0;
                hor = (EDITOR_WIDTH - imgH * p) / 2;
              }
            }
            if (imgHeight.value >= imgWidth.value) {
              mS = EDITOR_WIDTH / imgHeight.value;
            } else {
              if (
                imgHeight.value / imgWidth.value >
                EDITOR_WIDTH / EDITOR_HEIGHT
              ) {
                mS = EDITOR_WIDTH / imgHeight.value;
              } else {
                mS = EDITOR_HEIGHT / imgWidth.value;
              }
            }
          }
          if (rot.value === 1.5 || rot.value === 4.5) {
            if (imgW > imgH) {
              if (imgH / imgW < EDITOR_WIDTH / EDITOR_HEIGHT) {
                p = EDITOR_HEIGHT / imgW;
                hor = (EDITOR_WIDTH - imgH * p) / 2;
                vert = 0;
              } else {
                p = EDITOR_WIDTH / imgH;
                vert = (EDITOR_HEIGHT - imgW * p) / 2;
                hor = 0;
              }
            } else {
              p = EDITOR_WIDTH / imgH;
              hor = 0;
              vert = (EDITOR_HEIGHT - imgW * p) / 2;
            }
            if (imgHeight.value >= imgWidth.value) {
              if (
                imgHeight.value / imgWidth.value <
                EDITOR_WIDTH / EDITOR_HEIGHT
              ) {
                mS = EDITOR_WIDTH / imgWidth.value;
              } else {
                mS = EDITOR_HEIGHT / imgHeight.value;
              }
            } else {
              mS = EDITOR_WIDTH / imgWidth.value;
            }
          }
        }
        if (selectedAspect) {
          if (rot.value === 0 || rot.value === 3) {
            if (selectedAspect.value.x > selectedAspect.value.y) {
              if (
                selectedAspect.value.x / selectedAspect.value.y >
                imgHeight.value / imgWidth.value
              ) {
                p = EDITOR_WIDTH / imgHeight.value;
                y =
                  ((imgWidth.value * p - (EDITOR_HEIGHT - 2 * vertical.value)) /
                    2) *
                  (initProportion.value / p);
                x = 0;
              } else {
                p = (EDITOR_HEIGHT - top.value - bottom.value) / imgWidth.value;
                y = 0;
                x =
                  ((imgHeight.value * p -
                    (EDITOR_WIDTH - 2 * horizontal.value)) /
                    2) *
                  (initProportion.value / p);
              }
              boxHeight = width - 2 * y;
              boxWidth = height - 2 * x;
            } else {
              if (imgHeight.value >= imgWidth.value) {
                p = EDITOR_HEIGHT / imgWidth.value;
                y = 0;
                x =
                  ((imgHeight.value * p -
                    (EDITOR_WIDTH - 2 * horizontal.value)) /
                    2) *
                  (initProportion.value / p);
                boxHeight = width - 2 * y;
                boxWidth = height - 2 * x;
              }
              if (imgWidth.value > imgHeight.value) {
                if (
                  selectedAspect.value.y / selectedAspect.value.x >
                  imgWidth.value / imgHeight.value
                ) {
                  p = EDITOR_HEIGHT / imgWidth.value;
                  y = 0;
                  x =
                    ((imgHeight.value * p -
                      (EDITOR_WIDTH - 2 * horizontal.value)) /
                      2) *
                    (initProportion.value / p);
                  boxHeight = width - 2 * y;
                  boxWidth = height - 2 * x;
                } else {
                  p =
                    (EDITOR_WIDTH - left.value - right.value) / imgHeight.value;
                  y =
                    ((imgWidth.value * p -
                      (EDITOR_HEIGHT - 2 * vertical.value)) /
                      2) *
                    (initProportion.value / p);
                  x = 0;
                  boxHeight = width - 2 * y;
                  boxWidth = height - 2 * x;
                }
              }
            }
          }
          if (rot.value === 1.5 || rot.value === 4.5) {
            if (selectedAspect.value.x > selectedAspect.value.y) {
              if (imgHeight.value >= imgWidth.value) {
                p = EDITOR_WIDTH / imgWidth.value;
                x = 0;
                y =
                  ((imgHeight.value * p -
                    (EDITOR_HEIGHT - 2 * vertical.value)) /
                    2) *
                  (initProportion.value / p);
                boxHeight = height - 2 * y;
                boxWidth = width - 2 * x;
              }
              if (imgWidth.value > imgHeight.value) {
                if (
                  selectedAspect.value.x / selectedAspect.value.y >
                  imgWidth.value / imgHeight.value
                ) {
                  p = EDITOR_WIDTH / imgWidth.value;
                  x = 0;
                  y =
                    ((imgHeight.value * p -
                      (EDITOR_HEIGHT - 2 * vertical.value)) /
                      2) *
                    (initProportion.value / p);
                  boxHeight = height - 2 * y;
                  boxWidth = width - 2 * x;
                } else {
                  p =
                    (EDITOR_HEIGHT - top.value - bottom.value) /
                    imgHeight.value;
                  x =
                    ((imgWidth.value * p -
                      (EDITOR_WIDTH - 2 * horizontal.value)) /
                      2) *
                    (initProportion.value / p);
                  y = 0;
                  boxHeight = height - 2 * y;
                  boxWidth = width - 2 * x;
                }
              }
            } else {
              if (imgHeight.value >= imgWidth.value) {
                if (
                  selectedAspect.value.y / selectedAspect.value.x >
                  imgHeight.value / imgWidth.value
                ) {
                  p = EDITOR_HEIGHT / imgHeight.value;
                  x =
                    ((imgWidth.value * p -
                      (EDITOR_WIDTH - 2 * horizontal.value)) /
                      2) *
                    (initProportion.value / p);
                  y = 0;
                } else {
                  p =
                    (EDITOR_WIDTH - left.value - right.value) / imgWidth.value;
                  x = 0;
                  y =
                    ((imgHeight.value * p -
                      (EDITOR_HEIGHT - 2 * vertical.value)) /
                      2) *
                    (initProportion.value / p);
                }
              }
              if (imgWidth.value > imgHeight.value) {
                p = EDITOR_HEIGHT / imgHeight.value;
                x =
                  ((imgWidth.value * p -
                    (EDITOR_WIDTH - 2 * horizontal.value)) /
                    2) *
                  (initProportion.value / p);
                y = 0;
              }
              boxHeight = height - 2 * y;
              boxWidth = width - 2 * x;
            }
          }
        }

        if (!selectedAspect) {
          y = lastX;
          eX = -lastEY * (p / lastScale);
          eY = lastEX * (p / lastScale);
        } else {
          eX = 0;
          eY = 0;
        }
        if (rot.value === 0) {
          rot.value = 1.5;
          r = 1.5;
          if (!selectedAspect) {
            x = height - lastBoxHeight - lastY;
          }
        } else if (rot.value === 1.5) {
          rot.value = 3;
          r = 3;
          if (!selectedAspect) {
            // x = width - lastBoxWidth - lastY;
            x = width - lastBoxHeight - lastY;
          }
        } else if (rot.value === 3) {
          rot.value = 4.5;
          r = 4.5;
          if (!selectedAspect) {
            x = height - lastBoxHeight - lastY;
          }
        } else if (rot.value === 4.5) {
          rot.value = 0;
          r = 0;
          if (!selectedAspect) {
            // x = width - lastBoxWidth - lastY;
            x = width - lastBoxHeight - lastY;
          }
        }

        transformX.value = eX;
        transformY.value = eY;
        top.value = vert > 0 ? withTiming(vert) : withTiming(0);
        bottom.value = vert > 0 ? withTiming(vert) : withTiming(0);
        left.value = hor > 0 ? withTiming(hor) : withTiming(0);
        right.value = hor > 0 ? withTiming(hor) : withTiming(0);
        vertical.value = vert > 0 ? vert : 0;
        horizontal.value = hor > 0 ? hor : 0;
        scl.value = p;
        minScale.value = mS ? mS : p;
        proportion.value = initProportion.value / p;

        return {
          ...prev,
          [selectedIndex]: {
            ...prev[selectedIndex],
            count: prev[selectedIndex]?.count + 1,
            editor: [
              ...prev[index.value].editor.slice(
                0,
                prev[index.value]?.count + 1
              ),
              {
                ...prev[index.value].editor[last],
                aspect: selectedAspect,
                proportion: initProportion.value / p,
                scale: p,
                rotate: r,
                x: eX,
                y: eY,
                top: vert,
                bottom: vert,
                left: hor,
                right: hor,
              },
            ],
            settings: [
              ...prev[index.value].settings.slice(
                0,
                prev[index.value]?.count + 1
              ),
              {
                ...prev[index.value].settings[last],
                boxHeight,
                boxWidth,
                rotate: r * 60,
                x,
                y,
              },
            ],
          },
        };
      });
    };
    const setterForMoveHandler = (
      transformXCtx: number,
      transformYCtx: number
    ): void => {
      setInitialState((prev: any) => {
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        let tX, tY, trX, trY, x, y, width, height;
        const lastX = prev[index.value].settings[last].x;
        const lastY = prev[index.value].settings[last].y;
        const boxWidth = prev[index.value].settings[last].boxWidth;
        const boxHeight = prev[index.value].settings[last].boxHeight;

        if (rot.value === 0 || rot.value === 3) {
          width = prev[index.value].settings[0].width;
          height = prev[index.value].settings[0].height;
        } else {
          height = prev[index.value].settings[0].width;
          width = prev[index.value].settings[0].height;
        }

        // settings for backend
        tX = transformXCtx - transformX.value;
        if (lastX + tX * proportion.value <= 0) {
          x = 0;
        } else if (lastX + tX * proportion.value >= width - boxWidth) {
          x = width - boxWidth;
        } else {
          x = lastX + tX * proportion.value;
        }

        tY = transformYCtx - transformY.value;
        if (lastY + tY * proportion.value <= 0) {
          y = 0;
        } else if (lastY + tY * proportion.value >= height - boxHeight) {
          y = height - boxHeight;
        } else {
          y = lastY + tY * proportion.value;
        }

        // settings for editor
        const imgW =
          rot.value === 0 || rot.value === 3
            ? imgWidth.value * scl.value
            : imgHeight.value * scl.value;
        const minX = (EDITOR_WIDTH - imgW - left.value * 2) / 2;
        const maxX = (imgW - EDITOR_WIDTH + right.value * 2) / 2;
        const imgH =
          rot.value === 0 || rot.value === 3
            ? imgHeight.value * scl.value
            : imgWidth.value * scl.value;
        const minY = (EDITOR_HEIGHT - 2 * top.value - imgH) / 2;
        const maxY = (imgH - EDITOR_HEIGHT + 2 * bottom.value) / 2;
        if (transformX.value >= maxX) {
          trX = maxX;
        } else if (transformX.value <= minX) {
          trX = minX;
        } else {
          trX = transformX.value;
        }
        if (transformY.value >= maxY) {
          trY = maxY;
        } else if (transformY.value <= minY) {
          trY = minY;
        } else {
          trY = transformY.value;
        }

        if (
          prev[index.value].settings[last].x !== x ||
          prev[index.value].settings[last].y !== y
        ) {
          return {
            ...prev,
            [index.value]: {
              ...prev[index.value],
              count: prev[index.value]?.count + 1,
              settings: [
                ...prev[index.value].settings.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].settings[last],
                  x,
                  y,
                },
              ],
              editor: [
                ...prev[index.value].editor.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].editor[last],
                  x: trX,
                  y: trY,
                },
              ],
            },
          };
        } else {
          return prev;
        }
      });
    };
    const onMoveEvent = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      MoveCtxType
    >({
      onStart: (_, ctx) => {
        ctx.transformX = transformX.value;
        ctx.transformY = transformY.value;
        ctx.crop = crop.value;
        ctx.scale = scl.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setTransformStarted)(true);
        transformX.value = ctx.transformX + event.translationX;
        transformY.value = ctx.transformY + event.translationY;
      },
      onEnd: (_, ctx) => {
        runOnJS(setTransformStarted)(false);
        const imgW =
          rot.value === 0 || rot.value === 3
            ? imgWidth.value * scl.value
            : imgHeight.value * scl.value;
        const minX = (EDITOR_WIDTH - imgW - left.value * 2) / 2;
        const maxX = (imgW - EDITOR_WIDTH + right.value * 2) / 2;
        const imgH =
          rot.value === 0 || rot.value === 3
            ? imgHeight.value * scl.value
            : imgWidth.value * scl.value;
        const minY = (EDITOR_HEIGHT - 2 * top.value - imgH) / 2;
        const maxY = (imgH - EDITOR_HEIGHT + 2 * bottom.value) / 2;

        if (transformX.value >= maxX) {
          transformX.value = withSpring(maxX, { mass: 0.6 });
        }
        if (transformX.value <= minX) {
          transformX.value = withSpring(minX, { mass: 0.6 });
        }
        if (transformY.value >= maxY) {
          transformY.value = withSpring(maxY, { mass: 0.6 });
        }
        if (transformY.value <= minY) {
          transformY.value = withSpring(minY, { mass: 0.6 });
        }
        runOnJS(setterForMoveHandler)(ctx.transformX, ctx.transformY);
      },
    });

    const positionStyle = useAnimatedStyle(() => {
      return {
        transform: [
          { translateX: transformX.value },
          { translateY: transformY.value },
        ],
      };
    });
    const setterForScaleHandler = (): void => {
      setInitialState((prev: any) => {
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        // settings for backend
        const newProportion = initProportion.value / scl.value;
        const lastX = prev[index.value].settings[last].x;
        const lastY = prev[index.value].settings[last].y;
        const lastBoxWidth = prev[index.value].settings[last].boxWidth;
        const lastBoxHeight = prev[index.value].settings[last].boxHeight;
        const width = prev[index.value].settings[last].width;
        const height = prev[index.value].settings[last].height;
        const boxHeight =
          (EDITOR_HEIGHT - top.value - bottom.value) * newProportion;
        const boxWidth =
          (EDITOR_WIDTH - left.value - right.value) * newProportion;

        let x, y;
        const imgWi = imgWidth.value * scl.value;
        const viewWi = EDITOR_WIDTH - left.value - right.value;
        const imgHe = imgHeight.value * scl.value;
        const viewHe = EDITOR_HEIGHT - top.value - bottom.value;

        if (lastX + (lastBoxWidth - boxWidth) / 2 <= 0) {
          x = 0;
        } else if (lastX + (lastBoxWidth - boxWidth) / 2 >= width - boxWidth) {
          x = width - boxWidth;
        } else {
          if (imgWi < viewWi) {
            x = 0;
          } else {
            x = ((imgWi - viewWi) / 2 - transformX.value) * newProportion;
          }
        }

        if (lastY + (lastBoxHeight - boxHeight) / 2 <= 0) {
          y = 0;
        } else if (
          lastY + (lastBoxHeight - boxHeight) / 2 >=
          height - boxHeight
        ) {
          y = height - boxHeight;
        } else {
          if (imgHe < viewHe) {
            y = 0;
          } else {
            y = ((imgHe - viewHe) / 2 - transformY.value) * newProportion;
          }
        }
        proportion.value = newProportion;

        // settings for editor
        let trX = transformX.value,
          trY = transformY.value;
        const imgW =
          rot.value === 0 || rot.value === 3
            ? imgWidth.value * scl.value
            : imgHeight.value * scl.value;
        const minX = (EDITOR_WIDTH - imgW - left.value * 2) / 2;
        const maxX = (imgW - EDITOR_WIDTH + right.value * 2) / 2;
        const imgH =
          rot.value === 0 || rot.value === 3
            ? imgHeight.value * scl.value
            : imgWidth.value * scl.value;
        const minY = (EDITOR_HEIGHT - 2 * top.value - imgH) / 2;
        const maxY = (imgH - EDITOR_HEIGHT + 2 * bottom.value) / 2;

        // if (scaleCtx > scl.value) {
        if (transformX.value > 0 && maxX < transformX.value) {
          transformX.value = withSpring(maxX, {
            mass: 0.6,
          });
          trX = maxX;
          x = 0;
        }
        if (transformX.value < 0 && minX > transformX.value) {
          transformX.value = withSpring(minX, {
            mass: 0.6,
          });
          trX = minX;
          x = width - boxWidth;
        }
        if (transformY.value > 0 && maxY < transformY.value) {
          transformY.value = withSpring(maxY, {
            mass: 0.6,
          });
          trY = maxY;
          y = 0;
        }
        if (transformY.value < 0 && minY > transformY.value) {
          transformY.value = withSpring(minY, {
            mass: 0.6,
          });
          trY = minY;
          y = height - boxHeight;
        }
        // }

        if (
          lastBoxHeight !== boxHeight ||
          lastBoxWidth !== boxWidth ||
          lastX !== x ||
          lastY !== y
        ) {
          return {
            ...prev,
            [index.value]: {
              ...prev[index.value],
              count: prev[index.value]?.count + 1,
              settings: [
                ...prev[index.value].settings.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].settings[last],
                  boxHeight,
                  boxWidth,
                  x,
                  y,
                },
              ],
              editor: [
                ...prev[index.value].editor.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].editor[last],
                  top: top.value,
                  bottom: bottom.value,
                  left: left.value,
                  right: right.value,
                  scale: scl.value,
                  x: trX,
                  y: trY,
                  proportion: initProportion.value / scl.value,
                },
              ],
            },
          };
        } else {
          return prev;
        }
      });
    };
    const onScaleEvent = useAnimatedGestureHandler<
      PinchGestureHandlerGestureEvent,
      ScaleCtxType
    >({
      onStart: (_, ctx) => {
        ctx.scale = scl.value;
        ctx.rotate = rot.value;
        ctx.aspect = aspect.value;
        ctx.trX = transformX.value;
      },
      onActive: (event, ctx) => {
        const s = ctx.scale + (event.scale - 1);
        let vert;
        let hor;
        if (!ctx.aspect) {
          vert =
            ctx.rotate === 0 || ctx.rotate === 3
              ? (EDITOR_HEIGHT - imgHeight.value * scl.value) / 2
              : (EDITOR_HEIGHT - imgWidth.value * scl.value) / 2;
          hor =
            ctx.rotate === 0 || ctx.rotate === 3
              ? (EDITOR_WIDTH - imgWidth.value * scl.value) / 2
              : (EDITOR_WIDTH - imgHeight.value * scl.value) / 2;
        } else {
          vert = top.value;
          hor = left.value;
        }
        if (s >= minScale.value && s <= MAX_SCALE) {
          scl.value = s;
        }

        top.value = vert > 0 ? vert : 0;
        bottom.value = vert > 0 ? vert : 0;
        left.value = hor > 0 ? hor : 0;
        right.value = hor > 0 ? hor : 0;
        vertical.value = vert > 0 ? vert : 0;
        horizontal.value = hor > 0 ? hor : 0;
      },
      onEnd: () => {
        runOnJS(setCropStarted)(false);
        runOnJS(setterForScaleHandler)();
      },
    });

    const scaleStyle = useAnimatedStyle(() => {
      return { transform: [{ scale: scl.value }] };
    });

    // const onRotateEvent = useAnimatedGestureHandler<
    //   RotationGestureHandlerGestureEvent,
    //   { rotate: number; aspect: number }
    // >({
    //   onStart: (_, ctx) => {
    //     ctx.rotate = rot.value;
    //     ctx.aspect = aspect.value;
    //   },
    //   onActive: (event, ctx) => {
    //     rot.value = (ctx.rotate + event.rotation) % 6;
    //     if (ctx.aspect === 0) {
    //       top.value = withTiming(0);
    //       bottom.value = withTiming(0);
    //       left.value = withTiming(0);
    //       right.value = withTiming(0);
    //     }
    //   },
    //   onEnd: (event, ctx) => {
    //     runOnJS(setRotate)((rot.value = (ctx.rotate + event.rotation) % 6));
    //     runOnJS(setCropView)({ top: 0, bottom: 0, left: 0, right: 0 });
    //   },
    // });

    const rotateStyle = useAnimatedStyle(() => {
      return { transform: [{ rotate: `${rot.value * 60}deg` }] };
    });
    const setterForCropItemsHandler = () => {
      setInitialState((prev: any) => {
        // settings for backend
        const last =
          prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
            .length - 1;
        const lastX = prev[index.value].settings[last].x;
        const lastY = prev[index.value].settings[last].y;
        const lastBoxHeight = prev[index.value].settings[last].boxHeight;
        const lastBoxWidth = prev[index.value].settings[last].boxWidth;
        const lastR =
          imgWidth.value * initProportion.value - lastX - lastBoxWidth;
        const lastB =
          imgHeight.value * initProportion.value - lastY - lastBoxHeight;
        const r = lastR + (right.value - horizontal.value) * proportion.value;
        const l = lastX + (left.value - horizontal.value) * proportion.value;
        const b = lastB + (bottom.value - vertical.value) * proportion.value;
        const t = lastY + (top.value - vertical.value) * proportion.value;
        const boxHeight = imgHeight.value * initProportion.value - t - b;
        const boxWidth = imgWidth.value * initProportion.value - l - r;

        // settings for editor
        const h = EDITOR_HEIGHT - top.value - bottom.value;
        const w = EDITOR_WIDTH - left.value - right.value;
        const crop = imgResizer(h, w);
        proportion.value = initProportion.value / (scl.value * crop.proportion);
        const scale = scl.value * crop.proportion;
        const transY =
          (transformY.value - (top.value - bottom.value) / 2) * crop.proportion;
        const transX =
          (transformX.value - (left.value - right.value) / 2) * crop.proportion;
        transformY.value = withTiming(transY);
        transformX.value = withTiming(transX);
        scl.value = withTiming(scale);
        top.value = withTiming(crop.vertical);
        bottom.value = withTiming(crop.vertical);
        left.value = withTiming(crop.horizontal);
        right.value = withTiming(crop.horizontal);
        horizontal.value = crop.horizontal;
        vertical.value = crop.vertical;
        if (
          lastX !== l ||
          lastY !== t ||
          lastBoxHeight !== boxHeight ||
          lastBoxWidth !== boxWidth
        ) {
          return {
            ...prev,
            [index.value]: {
              ...prev[index.value],
              count: prev[index.value]?.count + 1,
              settings: [
                ...prev[index.value].settings.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].settings[last],
                  boxHeight,
                  boxWidth,
                  x: l,
                  y: t,
                },
              ],
              editor: [
                ...prev[index.value].editor.slice(
                  0,
                  prev[index.value]?.count + 1
                ),
                {
                  ...prev[index.value].editor[last],
                  top: crop.vertical,
                  bottom: crop.vertical,
                  left: crop.horizontal,
                  right: crop.horizontal,
                  x: transX,
                  y: transY,
                  scale: scale,
                  proportion: proportion.value / crop.proportion,
                },
              ],
            },
          };
        } else {
          return prev;
        }
      });
    };
    const onLTCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { t: number; l: number }
    >({
      onStart: (_, ctx) => {
        ctx.t = top.value;
        ctx.l = left.value;
        fingers.value = [...fingers.value, 1];
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const lPos = ctx.l + event.translationX;
        const tPos =
          aspect.value === 0
            ? ctx.t + event.translationY
            : ctx.t + event.translationX * aspectProportion.value;
        const lMax = EDITOR_WIDTH - right.value - SIZE_INSIDE_CROP_ITEMS;
        const tMax = EDITOR_HEIGHT - bottom.value - SIZE_INSIDE_CROP_ITEMS;
        if (lPos >= horizontal.value && lPos <= lMax) {
          left.value = lPos;
        }
        if (tPos >= vertical.value && tPos <= tMax) {
          top.value = tPos;
        }
      },
      onEnd: () => {
        runOnJS(setCropStarted)(false);
        fingers.value = fingers.value.filter((el) => el !== 1);
        if (fingers.value.length === 0) {
          runOnJS(setterForCropItemsHandler)();
        }
      },
    });
    const onRTCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { t: number; r: number }
    >({
      onStart: (_, ctx) => {
        ctx.t = top.value;
        ctx.r = right.value;
        fingers.value = [...fingers.value, 2];
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const rPos = ctx.r - event.translationX;
        const tPos =
          aspect.value === 0
            ? ctx.t + event.translationY
            : ctx.t - event.translationX * aspectProportion.value;
        const rMax = EDITOR_WIDTH - left.value - SIZE_INSIDE_CROP_ITEMS;
        const tMax = EDITOR_HEIGHT - bottom.value - SIZE_INSIDE_CROP_ITEMS;
        if (rPos >= horizontal.value && rPos <= rMax) {
          right.value = rPos;
        }
        if (tPos >= vertical.value && tPos <= tMax) {
          top.value = tPos;
        }
      },
      onEnd: () => {
        runOnJS(setCropStarted)(false);
        fingers.value = fingers.value.filter((el) => el !== 2);
        if (fingers.value.length === 0) {
          runOnJS(setterForCropItemsHandler)();
        }
      },
    });
    const onLBCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { b: number; l: number }
    >({
      onStart: (_, ctx) => {
        ctx.b = bottom.value;
        ctx.l = left.value;
        fingers.value = [...fingers.value, 3];
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const lPos = ctx.l + event.translationX;
        const bPos =
          aspect.value === 0
            ? ctx.b - event.translationY
            : ctx.b + event.translationX * aspectProportion.value;
        const bMax = EDITOR_HEIGHT - top.value - SIZE_INSIDE_CROP_ITEMS;
        const lMax = EDITOR_WIDTH - right.value - SIZE_INSIDE_CROP_ITEMS;
        if (bPos >= vertical.value && bPos <= bMax) {
          bottom.value = bPos;
        }
        if (lPos >= horizontal.value && lPos <= lMax) {
          left.value = lPos;
        }
      },
      onEnd: () => {
        runOnJS(setCropStarted)(false);
        fingers.value = fingers.value.filter((el) => el !== 3);
        if (fingers.value.length === 0) {
          runOnJS(setterForCropItemsHandler)();
        }
      },
    });
    const onRBCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { b: number; r: number }
    >({
      onStart: (_, ctx) => {
        ctx.b = bottom.value;
        ctx.r = right.value;
        fingers.value = [...fingers.value, 4];
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const rPos = ctx.r - event.translationX;
        const bPos =
          aspect.value === 0
            ? ctx.b - event.translationY
            : ctx.b - event.translationX * aspectProportion.value;
        const rMax = EDITOR_WIDTH - left.value - SIZE_INSIDE_CROP_ITEMS;
        const bMax = EDITOR_HEIGHT - top.value - SIZE_INSIDE_CROP_ITEMS;
        if (rPos >= horizontal.value && rPos <= rMax) {
          right.value = rPos;
        }
        if (bPos >= vertical.value && bPos <= bMax) {
          bottom.value = bPos;
        }
      },
      onEnd: () => {
        runOnJS(setCropStarted)(false);
        fingers.value = fingers.value.filter((el) => el !== 4);
        if (fingers.value.length === 0) {
          runOnJS(setterForCropItemsHandler)();
        }
      },
    });

    const cropViewStyle = useAnimatedStyle(() => {
      return {
        top: top.value,
        bottom: bottom.value,
        left: left.value,
        right: right.value,
      };
    });

    const onAspectHandler = (aspect: aspectType | null): void => {
      if (aspect) {
        aspectProportion.value = aspect?.value?.y / aspect?.value?.x;
        let vert = vertical.value,
          hor = horizontal.value,
          s = scl.value,
          imgH = 0,
          imgW = 0;
        transformX.value = withTiming(0);
        transformY.value = withTiming(0);
        setInitialState((prev: any) => {
          const aspectObj: { [keys: string]: imagesConfigsType } = {};
          Object.keys(prev).map((item, index) => {
            const img = imgResizer(
              prev?.[item]?.settings?.[0]?.height,
              prev?.[item]?.settings?.[0]?.width
            );
            imgH = img.height;
            imgW = img.width;

            const last =
              prev[item].settings.slice(0, prev[item]?.count + 1).length - 1;
            const lastRotate = prev[item].settings[last].rotate;
            if (lastRotate === 0 || lastRotate === 180) {
              if (imgH >= imgW) {
                if (aspect.value.x > aspect.value.y) {
                  vert =
                    (EDITOR_HEIGHT -
                      (EDITOR_WIDTH * aspect.value.y) / aspect.value.x) /
                    2;
                  hor = 0;
                  if ((EDITOR_WIDTH - imgW) / 2 > hor) {
                    const proportions = (EDITOR_WIDTH - 2 * hor) / imgW;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  } else {
                    scl.value = withTiming(EDITOR_WIDTH / imgW);
                    s = EDITOR_WIDTH / imgW;
                  }
                } else {
                  vert = 0;
                  hor =
                    (EDITOR_WIDTH -
                      (EDITOR_HEIGHT * aspect.value.x) / aspect.value.y) /
                    2;
                  if ((EDITOR_WIDTH - imgW) / 2 > hor) {
                    const proportions = (EDITOR_WIDTH - 2 * hor) / imgW;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  } else {
                    scl.value = withTiming(EDITOR_HEIGHT / imgH);
                    s = EDITOR_HEIGHT / imgH;
                  }
                }
              }
              if (imgH < imgW) {
                if (aspect.value.x > aspect.value.y) {
                  vert =
                    (EDITOR_HEIGHT -
                      (EDITOR_WIDTH * aspect.value.y) / aspect.value.x) /
                    2;
                  hor = 0;
                  if ((EDITOR_HEIGHT - imgH) / 2 > vert) {
                    const proportions = (EDITOR_HEIGHT - 2 * vert) / imgH;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  } else {
                    scl.value = withTiming(EDITOR_WIDTH / imgW);
                    s = EDITOR_WIDTH / imgW;
                  }
                } else {
                  vert = 0;
                  hor =
                    (EDITOR_WIDTH -
                      (EDITOR_HEIGHT * aspect.value.x) / aspect.value.y) /
                    2;
                  scl.value = withTiming(EDITOR_HEIGHT / imgH);
                  s = EDITOR_HEIGHT / imgH;
                }
              }
            }
            if (lastRotate === 90 || lastRotate === 270) {
              if (imgW >= imgH) {
                if (aspect.value.x > aspect.value.y) {
                  vert =
                    (EDITOR_HEIGHT -
                      (EDITOR_WIDTH * aspect.value.y) / aspect.value.x) /
                    2;
                  hor = 0;
                  if (
                    aspect.value.x / aspect.value.y >
                    imgWidth.value / imgHeight.value
                  ) {
                    const proportions = (EDITOR_WIDTH - 2 * hor) / imgH;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  } else {
                    scl.value = withTiming(EDITOR_WIDTH / imgH);
                    s = EDITOR_WIDTH / imgH;
                  }
                } else {
                  vert = 0;
                  hor =
                    (EDITOR_WIDTH -
                      (EDITOR_HEIGHT * aspect.value.x) / aspect.value.y) /
                    2;
                  if (
                    aspect.value.y / aspect.value.x >
                    imgWidth.value / imgHeight.value
                  ) {
                    scl.value = withTiming(EDITOR_HEIGHT / imgW);
                    s = EDITOR_HEIGHT / imgW;
                  } else {
                    const proportions = (EDITOR_WIDTH - 2 * hor) / imgH;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  }
                }
              }
              if (imgW < imgH) {
                if (aspect.value.x > aspect.value.y) {
                  vert =
                    (EDITOR_HEIGHT -
                      (EDITOR_WIDTH * aspect.value.y) / aspect.value.x) /
                    2;
                  hor = 0;
                  if (
                    aspect.value.x / aspect.value.y <
                    imgHeight.value / imgWidth.value
                  ) {
                    const proportions = (EDITOR_HEIGHT - 2 * vert) / imgW;
                    scl.value = withTiming(proportions);
                    s = proportions;
                  } else {
                    scl.value = withTiming(EDITOR_WIDTH / imgH);
                    s = EDITOR_WIDTH / imgH;
                  }
                } else {
                  vert = 0;
                  hor =
                    (EDITOR_WIDTH -
                      (EDITOR_HEIGHT * aspect.value.x) / aspect.value.y) /
                    2;
                  scl.value = withTiming(EDITOR_HEIGHT / imgW);
                  s = EDITOR_HEIGHT / imgW;
                }
              }
            }

            const lastX = prev[item].settings[last].x;
            const lastY = prev[item].settings[last].y;
            const lastBoxHeight = prev[item].settings[last].boxHeight;
            const lastBoxWidth = prev[item].settings[last].boxWidth;
            const boxHeight = (EDITOR_HEIGHT - vert * 2) * (img.proportion / s);
            const boxWidth = (EDITOR_WIDTH - hor * 2) * (img.proportion / s);
            const x = lastX + (lastBoxWidth - boxWidth) / 2;
            const y = lastY + (lastBoxHeight - boxHeight) / 2;

            vertical.value = vert;
            horizontal.value = hor;
            top.value = withTiming(vert);
            bottom.value = withTiming(vert);
            left.value = withTiming(hor);
            right.value = withTiming(hor);

            if (aspectObj?.[selectedIndex] !== undefined) {
              const l = (aspectObj?.[selectedIndex]?.editor?.length ?? 0) - 1;
              const lastScale =
                aspectObj?.[selectedIndex]?.editor?.[l]?.scale ?? 0;
              scl.value = withTiming(lastScale);
              minScale.value = lastScale;
            }
            if (selectedIndex === index) {
              proportion.value = img.proportion / s;
            }
            aspectObj[item] = {
              ...prev?.[item],
              ...{
                count: prev[item]?.count + 1,
                settings: [
                  ...prev[item].settings.slice(0, prev[item]?.count + 1),
                  {
                    ...prev[item].settings[last],
                    boxHeight,
                    boxWidth,
                    x: x > 0 ? x : 0,
                    y: y > 0 ? y : 0,
                  },
                ],
                editor: [
                  ...prev[item].editor.slice(0, prev[item]?.count + 1),
                  {
                    ...prev[item].editor[last],
                    aspect,
                    top: vert,
                    bottom: vert,
                    left: hor,
                    right: hor,
                    scale: s,
                    minScale: s,
                    proportion: img.proportion / s,
                    x: 0,
                    y: 0,
                  },
                ],
              },
            };
          });
          return aspectObj;
        });
      } else {
        setInitialState((prev: any) => {
          const last =
            prev[index.value].settings.slice(0, prev[index.value]?.count + 1)
              .length - 1;
          const lastRotate = prev[selectedIndex].settings[last].rotate;
          if (lastRotate === 0 || lastRotate === 180) {
            minScale.value = editorSettings[0]?.minScale ?? 0;
          }
          if (lastRotate === 90 || lastRotate === 270) {
            if (imgHeight.value >= imgWidth.value) {
              minScale.value = EDITOR_WIDTH / imgHeight.value;
            } else {
              if (
                EDITOR_HEIGHT / EDITOR_WIDTH >
                imgWidth.value / imgHeight.value
              ) {
                minScale.value = EDITOR_WIDTH / imgHeight.value;
              } else {
                minScale.value = EDITOR_HEIGHT / imgWidth.value;
              }
            }
          }
          return {
            ...prev,
            [selectedIndex]: {
              ...prev[selectedIndex],
              count: (prev[selectedIndex]?.count ?? 0) + 1,
              settings: [
                ...prev[selectedIndex].settings.slice(
                  0,
                  prev[selectedIndex]?.count + 1
                ),
                {
                  ...prev[selectedIndex].settings[last],
                },
              ],
              editor: [
                ...prev[selectedIndex].editor.slice(
                  0,
                  prev[selectedIndex]?.count + 1
                ),
                {
                  ...prev[selectedIndex].editor[last],
                  aspect: null,
                },
              ],
            },
          };
        });
      }
    };

    useEffect(() => {
      aspect.value = selectedAspect ? 1 : 0;
    }, [selectedAspect]);

    useEffect(() => {
      crop.value = selectedBtn === SelectedBtnType.CROP ? 1 : 0;
    }, [selectedBtn]);

    useEffect(() => {
      const img = imgResizer(
        imageSettings?.[counter]?.height ?? 0,
        imageSettings?.[counter]?.width ?? 0
      );
      if (img.height && img.width) {
        imgHeight.value = img.height;
        imgWidth.value = img.width;
        resetEditor(counter);
        index.value = selectedIndex;
        setFakeCounter(fakeCounter + 1);
      }
    }, [selectedIndex]);

    // useEffect(() => {
    //   // cropStarted && setTransformStarted(false);
    //   // transformStarted && setCropStarted(false);
    //   if (cropStarted) {
    //     borderWidth.value = withTiming(0, { duration: 100 });
    //   } else {
    //     borderWidth.value = withTiming(
    //       editorSettings[counter]?.border?.width || 0
    //     );
    //   }
    // }, [cropStarted, transformStarted]);

    const topBlockStyle = useAnimatedStyle(() => {
      return { height: top.value };
    });
    const bottomBlockStyle = useAnimatedStyle(() => {
      return { height: bottom.value };
    });
    const leftBlockStyle = useAnimatedStyle(() => {
      return { width: left.value };
    });
    const rightBlockStyle = useAnimatedStyle(() => {
      return { width: right.value };
    });
    return (
      <GestureHandlerRootView style={[s.container, styleContainer]}>
        <PanGestureHandler
          maxPointers={1}
          onGestureEvent={!cropStarted ? onMoveEvent : () => {}}
        >
          <Animated.View
            pointerEvents={cropStarted ? 'none' : undefined}
            style={[sizeStyle, positionStyle]}
          >
            {/*<RotationGestureHandler onGestureEvent={onRotateEvent}>*/}
            <Animated.View
              pointerEvents={transformStarted ? 'none' : undefined}
              style={[s.fullScreen, rotateStyle]}
            >
              <PinchGestureHandler
                onGestureEvent={!transformStarted ? onScaleEvent : () => {}}
              >
                <Animated.View
                  pointerEvents={transformStarted ? 'none' : undefined}
                  style={[s.fullScreen, scaleStyle]}
                >
                  <Animated.View style={flipStyle}>
                    <FastImage
                      style={s.fullScreen}
                      source={{
                        uri: image,
                        priority: FastImage.priority.high,
                      }}
                      resizeMode={FastImage.resizeMode.cover}
                      onLoad={() => {
                        setFakeCounter(fakeCounter + 1);
                      }}
                    />
                  </Animated.View>
                </Animated.View>
              </PinchGestureHandler>
            </Animated.View>
            {/*</RotationGestureHandler>*/}
          </Animated.View>
        </PanGestureHandler>
        <Animated.View
          style={[s.cropContainer, borderStyle, cropViewStyle]}
          pointerEvents={'box-none'}
        />
        {selectedBtn === SelectedBtnType.CROP ? (
          <Animated.View
            style={[s.cropContainer, cropViewStyle]}
            pointerEvents={'box-none'}
          >
            {cropStarted ? (
              <Image
                resizeMode={'stretch'}
                style={[s.fullScreen, { tintColor: colors.white }]}
                source={images.grid}
              />
            ) : null}
            <CropItems
              topLeft={!transformStarted ? onLTCropHandler : () => {}}
              topRight={!transformStarted ? onRTCropHandler : () => {}}
              bottomLeft={!transformStarted ? onLBCropHandler : () => {}}
              bottomRight={!transformStarted ? onRBCropHandler : () => {}}
            />
          </Animated.View>
        ) : null}
        <BackgroundFill
          top={topBlockStyle}
          left={leftBlockStyle}
          bottom={bottomBlockStyle}
          right={rightBlockStyle}
        />
      </GestureHandlerRootView>
    );
  }
);

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: EDITOR_HEIGHT,
    width: EDITOR_WIDTH,
  },
  fullScreen: {
    height: '100%',
    width: '100%',
  },
  cropContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
});
