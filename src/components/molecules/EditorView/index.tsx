import React, {
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../../../assets/colors';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PinchGestureHandler,
  RotationGestureHandler,
  RotationGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler/src/handlers/gestureHandlerTypesCompat';
import { SelectedBtnType } from '../BtnGroup';
import {
  EDITOR_HEIGHT,
  EDITOR_WIDTH,
  SIZE_INSIDE_CROP_ITEMS,
} from '../../../utils/constants';
import { Icon } from '../../atoms';
import { images } from '../../../assets/images';
import { useMount } from '../../../hooks/useMount';
import { imgResizer } from '../../../utils/imgResizer';
import { ViewShotWindow } from '../ViewShotWindow';
import type { aspectType } from '../../organizm';
import { icons } from '../../../assets/icons';

type Props = {
  img: string;
  styleContainer?: StyleProp<ViewStyle>;
  selectedBtn: SelectedBtnType;
  selectedColor?: string | null;
  selectedAspect?: aspectType['value'];
  setSelectedAspect: (selectedAspect: null) => void;
  setSelectedColor: (color: null) => void;
  counter: number;
  setCounter: (prev: number | ((count: number) => number)) => void;
  cropImages: string[];
  setCropImages: (images: string[]) => void;
};

export type EditorRef = {
  reset: () => void;
  rotate: () => void;
  redo: () => void;
  undo: () => void;
};

export const EditorView = forwardRef<EditorRef, Props>(
  (
    {
      img,
      styleContainer,
      selectedBtn,
      selectedAspect,
      setSelectedAspect,
      selectedColor,
      setSelectedColor,
      counter,
      setCounter,
      cropImages,
      setCropImages,
    },
    ref
  ) => {
    const viewShotRef = useRef<any>(null);
    const [image, setImage] = useState('');
    const [cropView, setCropView] = useState({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    });
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

    useImperativeHandle(ref, () => ({
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
    }));

    const resizer = (img: string) => {
      Image.getSize(img, (w: number, h: number): void => {
        const size = imgResizer({
          height: h,
          width: w,
          measure: { width: EDITOR_WIDTH, height: EDITOR_HEIGHT },
        });
        let vertical;
        let horizontal;
        if (size.height && size.width) {
          vertical = (EDITOR_HEIGHT - size.height) / 2;
          horizontal = (EDITOR_WIDTH - size.width) / 2;
          imgHeight.value = withTiming(size.height);
          imgWidth.value = withTiming(size.width);
          top.value = withTiming(vertical);
          bottom.value = withTiming(vertical);
          left.value = withTiming(horizontal);
          right.value = withTiming(horizontal);
          setCropView({
            top: vertical,
            bottom: vertical,
            left: horizontal,
            right: horizontal,
          });
        }
      });
    };
    const sizeStyle = useAnimatedStyle(() => {
      return { height: imgHeight.value, width: imgWidth.value };
    });

    const resetEditor = () => {
      rot.value = 0;
      scl.value = withTiming(1);
      transformX.value = withTiming(0);
      transformY.value = withTiming(0);
      top.value = withTiming(top.value);
      bottom.value = withTiming(bottom.value);
      left.value = withTiming(left.value);
      right.value = withTiming(right.value);
    };

    const onRedoHandler = () => {
      if (counter < cropImages.length - 1) {
        resizer(cropImages[counter + 1]);
        setCounter((prev) => prev + 1);
        resetEditor();
      }
    };

    const onUndoHandler = () => {
      if (counter > 0) {
        resizer(cropImages[counter - 1]);
        setCounter((prev) => prev - 1);
        resetEditor();
      }
    };

    const onResetHandler = () => {
      setCropImages([]);
      setCounter(0);
      setImage(img);
      resizer(img);
      resetEditor();
      setSelectedColor(null);
      setSelectedAspect(null);
    };

    const onCropHandler = async (): Promise<void> => {
      if (viewShotRef?.current?.capture) {
        const imageURI = await viewShotRef?.current?.capture();
        if (imageURI) {
          setImage(`data:image/jpeg;base64,${imageURI}`);
          if (rot.value !== 0) {
            rot.value = 0;
          }
          setCropStarted(false);
          scl.value = withTiming(1);
          transformX.value = withTiming(0);
          transformY.value = withTiming(0);
          setCounter((prev) => prev + 1);
          resizer(`data:image/jpeg;base64,${imageURI}`);
        }
        setSelectedAspect(null);
      }
    };

    const onRotateHandler = () => {
      if (aspect.value === 1) {
        scl.value = 1;
      }
      if (
        (rot.value >= 0 && rot.value < 1.5) ||
        (rot.value <= -4.5 && rot.value > -6)
      ) {
        rot.value = withSpring(1.5, { damping: 10, mass: 0.5 });
      } else if (
        (rot.value >= 1.5 && rot.value < 3) ||
        (rot.value <= -3 && rot.value > -4.5)
      ) {
        rot.value = withSpring(3, { damping: 10, mass: 0.5 });
      } else if (
        (rot.value >= 3 && rot.value < 4.5) ||
        (rot.value <= -1.5 && rot.value > -3)
      ) {
        rot.value = withSpring(4.5, { damping: 10, mass: 0.5 });
      } else {
        rot.value = withSpring(0, { damping: 11, mass: 0.5 });
      }
      let vertical;
      let horizontal;
      if (rot.value === 0 || rot.value === 3) {
        if (imgHeight.value > imgWidth.value) {
          const width = imgWidth.value / (imgHeight.value / EDITOR_WIDTH);
          imgHeight.value = withTiming(EDITOR_WIDTH);
          imgWidth.value = withTiming(width);
          vertical = (EDITOR_HEIGHT - width * scl.value) / 2;
          horizontal = (EDITOR_WIDTH - EDITOR_WIDTH * scl.value) / 2;
        } else {
          if (imgWidth.value / imgHeight.value < EDITOR_WIDTH / EDITOR_HEIGHT) {
            const width = imgHeight.value * (imgHeight.value / imgWidth.value);
            imgHeight.value = withTiming(EDITOR_WIDTH);
            imgWidth.value = withTiming(width);
            vertical = (EDITOR_HEIGHT - EDITOR_WIDTH * scl.value) / 2;
            horizontal = (EDITOR_WIDTH - width * scl.value) / 2;
          } else {
            const height = imgHeight.value * (EDITOR_HEIGHT / imgWidth.value);
            imgHeight.value = withTiming(height);
            imgWidth.value = withTiming(EDITOR_HEIGHT);
            vertical = (EDITOR_HEIGHT - EDITOR_HEIGHT * scl.value) / 2;
            horizontal = (EDITOR_WIDTH - height * scl.value) / 2;
          }
        }
      } else {
        if (imgHeight.value > imgWidth.value) {
          if (imgHeight.value / imgWidth.value < EDITOR_HEIGHT / EDITOR_WIDTH) {
            const height = imgHeight.value * (imgHeight.value / imgWidth.value);
            imgHeight.value = withTiming(height);
            imgWidth.value = withTiming(EDITOR_WIDTH);
            vertical = (EDITOR_HEIGHT - height * scl.value) / 2;
            horizontal = (EDITOR_WIDTH - EDITOR_WIDTH * scl.value) / 2;
          } else {
            const width = imgWidth.value * (EDITOR_HEIGHT / imgHeight.value);
            imgHeight.value = withTiming(EDITOR_HEIGHT);
            imgWidth.value = withTiming(width);
            vertical = (EDITOR_HEIGHT - EDITOR_HEIGHT * scl.value) / 2;
            horizontal = (EDITOR_WIDTH - width * scl.value) / 2;
          }
        } else {
          const height = imgHeight.value / (imgWidth.value / EDITOR_WIDTH);
          imgHeight.value = withTiming(height);
          imgWidth.value = withTiming(EDITOR_WIDTH);
          vertical = (EDITOR_HEIGHT - height * scl.value) / 2;
          horizontal = (EDITOR_WIDTH - EDITOR_WIDTH * scl.value) / 2;
        }
      }
      top.value = vertical > 0 ? vertical : 0;
      bottom.value = vertical > 0 ? vertical : 0;
      left.value = horizontal > 0 ? horizontal : 0;
      right.value = horizontal > 0 ? horizontal : 0;
      setCropView({
        top: vertical > 0 ? vertical : 0,
        left: horizontal > 0 ? horizontal : 0,
        bottom: vertical > 0 ? vertical : 0,
        right: horizontal > 0 ? horizontal : 0,
      });
      transformY.value = withTiming(0);
      transformX.value = withTiming(0);
    };

    const onMoveEvent = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { transformX: number; transformY: number; crop: number; scale: number }
    >({
      onStart: (_, ctx) => {
        ctx.transformX = transformX.value;
        ctx.transformY = transformY.value;
        ctx.crop = crop.value;
        ctx.scale = scl.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setTransformStarted)(true);
        crop.value === 1 && runOnJS(setCropStarted)(true);
        const x = ctx.transformX + event.translationX;
        const y = ctx.transformY + event.translationY;
        const width =
          rot.value === 0 || rot.value === 3
            ? imgWidth.value * scl.value
            : imgHeight.value * scl.value;
        const minX = (EDITOR_WIDTH - width - left.value * 2) / 2;
        const maxX = (width - EDITOR_WIDTH + right.value * 2) / 2;
        const height =
          rot.value === 0 || rot.value === 3
            ? imgHeight.value * scl.value
            : imgWidth.value * scl.value;
        const minY = (EDITOR_HEIGHT - 2 * top.value - height) / 2;
        const maxY = (height - EDITOR_HEIGHT + 2 * bottom.value) / 2;

        if (
          (rot.value !== 0 &&
            rot.value !== 1.5 &&
            rot.value !== 3 &&
            rot.value !== 4.5) ||
          !ctx.crop
        ) {
          transformX.value = x;
          transformY.value = y;
        }

        if (!!ctx.crop) {
          if (x >= minX && x <= maxX) {
            transformX.value = x;
          }
          if (y >= minY && y <= maxY) {
            transformY.value = y;
          }
        } else if (
          rot.value === 0 ||
          rot.value === 1.5 ||
          rot.value === 3 ||
          rot.value === 4.5
        ) {
          if (x >= maxX) {
            transformX.value = withSpring(maxX, { mass: 0.6 });
          }
          if (x <= minX) {
            transformX.value = withSpring(minX, { mass: 0.6 });
          }
          if (y >= maxY) {
            transformY.value = withSpring(maxY, { mass: 0.6 });
          }
          if (y <= minY) {
            transformY.value = withSpring(minY, { mass: 0.6 });
          }
        }
      },
      onEnd: (_, ctx) => {
        runOnJS(setTransformStarted)(false);
        ctx.crop === 1 && runOnJS(onCropHandler)();
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

    const onScaleEvent = useAnimatedGestureHandler<
      PinchGestureHandlerGestureEvent,
      {
        scale: number;
        t: number;
        b: number;
        l: number;
        r: number;
        rotate: number;
        aspect: number;
      }
    >({
      onStart: (_, ctx) => {
        ctx.scale = scl.value;
        ctx.t = top.value;
        ctx.b = bottom.value > 0 ? -bottom.value : bottom.value;
        ctx.l = left.value;
        ctx.r = right.value > 0 ? -right.value : right.value;
        ctx.rotate = rot.value;
        ctx.aspect = aspect.value;
      },
      onActive: (event, ctx) => {
        const s = ctx.scale + (event.scale - 1);
        let vertical;
        let horizontal;
        if (ctx.aspect === 0) {
          if (s > 0.3 && s < 10) {
            scl.value = s;
          }
          vertical =
            ctx.rotate === 0 || ctx.rotate === 3
              ? (EDITOR_HEIGHT - imgHeight.value * scl.value) / 2
              : (EDITOR_HEIGHT - imgWidth.value * scl.value) / 2;
          horizontal =
            ctx.rotate === 0 || ctx.rotate === 3
              ? (EDITOR_WIDTH - imgWidth.value * scl.value) / 2
              : (EDITOR_WIDTH - imgHeight.value * scl.value) / 2;
          if (
            rot.value !== 0 &&
            rot.value !== 1.5 &&
            rot.value !== 3 &&
            rot.value !== 4.5
          ) {
            horizontal = 0;
            vertical = 0;
          }
        } else {
          vertical = ctx.t;
          horizontal = ctx.l;
          if (ctx.t > ctx.l) {
            if (rot.value === 0 || rot.value === 3) {
              if (s >= EDITOR_WIDTH / imgWidth.value && s <= 10) {
                scl.value = s;
              }
            } else {
              if (s >= EDITOR_WIDTH / imgHeight.value && s <= 10) {
                scl.value = s;
              }
            }
          } else {
            if (rot.value === 0 || rot.value === 3) {
              if (s >= EDITOR_HEIGHT / imgHeight.value && s <= 10) {
                scl.value = s;
              }
            } else {
              if (s >= EDITOR_HEIGHT / imgWidth.value && s <= 10) {
                scl.value = s;
              }
            }
          }
        }
        top.value = vertical > 0 ? vertical : 0;
        bottom.value = vertical > 0 ? vertical : 0;
        left.value = horizontal > 0 ? horizontal : 0;
        right.value = horizontal > 0 ? horizontal : 0;
      },
      onEnd: (_, ctx) => {
        runOnJS(setCropView)({
          top: top.value,
          bottom: bottom.value,
          left: left.value,
          right: right.value,
        });
        if (ctx.scale - scl.value > 0.3) {
          transformY.value = withTiming(0);
          transformX.value = withTiming(0);
        }
      },
    });

    const scaleStyle = useAnimatedStyle(() => {
      return { transform: [{ scale: scl.value }] };
    });

    const onRotateEvent = useAnimatedGestureHandler<
      RotationGestureHandlerGestureEvent,
      { rotate: number; aspect: number }
    >({
      onStart: (_, ctx) => {
        ctx.rotate = rot.value;
        ctx.aspect = aspect.value;
      },
      onActive: (event, ctx) => {
        rot.value = (ctx.rotate + event.rotation) % 6;
        if (ctx.aspect === 0) {
          top.value = withTiming(0);
          bottom.value = withTiming(0);
          left.value = withTiming(0);
          right.value = withTiming(0);
        }
      },
      onEnd: () => {
        runOnJS(setCropView)({ top: 0, bottom: 0, left: 0, right: 0 });
      },
    });

    const rotateStyle = useAnimatedStyle(() => {
      return { transform: [{ rotate: `${rot.value * 60}deg` }] };
    });

    const onLTCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { t: number; l: number; cropProc: number }
    >({
      onStart: (_, ctx) => {
        ctx.t = top.value;
        ctx.l = left.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const lPos = ctx.l + event.translationX;
        if (
          lPos >= ctx.l &&
          lPos <= EDITOR_WIDTH - right.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          left.value = lPos;
        }
        const tPos = ctx.t + event.translationY;
        if (
          tPos >= ctx.t &&
          tPos <= EDITOR_HEIGHT - bottom.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          top.value = tPos;
        }
        runOnJS(setCropView)({
          top: top.value,
          left: left.value,
          bottom: bottom.value,
          right: right.value,
        });
      },
      onEnd: () => {
        runOnJS(onCropHandler)();
      },
    });
    const onRTCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { t: number; r: number }
    >({
      onStart: (_, ctx) => {
        ctx.t = top.value;
        ctx.r = right.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const rPos = ctx.r + -event.translationX;
        if (
          rPos >= ctx.r &&
          rPos <= EDITOR_WIDTH - left.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          right.value = rPos;
        }
        const tPos = ctx.t + event.translationY;
        if (
          tPos >= ctx.t &&
          tPos <= EDITOR_HEIGHT - bottom.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          top.value = tPos;
        }
        runOnJS(setCropView)({
          top: top.value,
          left: left.value,
          bottom: bottom.value,
          right: right.value,
        });
      },
      onEnd: () => {
        runOnJS(onCropHandler)();
      },
    });
    const onLBCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { b: number; l: number }
    >({
      onStart: (_, ctx) => {
        ctx.b = bottom.value;
        ctx.l = left.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const bPos = ctx.b + -event.translationY;
        if (
          bPos >= ctx.b &&
          bPos <= EDITOR_HEIGHT - top.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          bottom.value = bPos;
        }
        const lPos = ctx.l + event.translationX;
        if (
          lPos >= ctx.l &&
          lPos <= EDITOR_WIDTH - right.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          left.value = lPos;
        }
        runOnJS(setCropView)({
          top: top.value,
          left: left.value,
          bottom: bottom.value,
          right: right.value,
        });
      },
      onEnd: () => {
        runOnJS(onCropHandler)();
      },
    });
    const onRBCropHandler = useAnimatedGestureHandler<
      PanGestureHandlerGestureEvent,
      { b: number; r: number }
    >({
      onStart: (_, ctx) => {
        ctx.b = bottom.value;
        ctx.r = right.value;
      },
      onActive: (event, ctx) => {
        runOnJS(setCropStarted)(true);
        const rPos = ctx.r + -event.translationX;
        if (
          rPos >= ctx.r &&
          rPos <= EDITOR_WIDTH - left.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          right.value = rPos;
        }
        const bPos = ctx.b + -event.translationY;
        if (
          bPos >= ctx.b &&
          bPos <= EDITOR_HEIGHT - top.value - SIZE_INSIDE_CROP_ITEMS
        ) {
          bottom.value = bPos;
        }
        runOnJS(setCropView)({
          top: top.value,
          left: left.value,
          bottom: bottom.value,
          right: right.value,
        });
      },
      onEnd: () => {
        runOnJS(onCropHandler)();
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

    useMount(() => {
      setImage(img);
      resizer(img);
    });

    useEffect(() => {
      if (image.length > 0) {
        setCropImages([...cropImages.slice(0, counter + 1), image]);
        setImage('');
      }
    }, [image]);

    useEffect(() => {
      if (selectedBtn === SelectedBtnType.CROP) {
        crop.value = 1;
      } else {
        crop.value = 0;
        setSelectedAspect(null);
      }
    }, [selectedBtn]);

    useEffect(() => {
      if (selectedAspect) {
        scl.value = 1;
        aspect.value = 1;
        let vertical;
        let horizontal;

        if (imgHeight.value > imgWidth.value) {
          if (selectedAspect.x > selectedAspect.y) {
            vertical =
              (EDITOR_HEIGHT -
                (EDITOR_WIDTH * selectedAspect.y) / selectedAspect.x) /
              2;
            horizontal = 0;
            if (rot.value === 0 || rot.value === 3) {
              if ((EDITOR_WIDTH - imgWidth.value) / 2 > horizontal) {
                const proportions =
                  (EDITOR_WIDTH - 2 * horizontal) / imgWidth.value;
                scl.value = withTiming(proportions);
              } else {
                scl.value = withTiming(EDITOR_WIDTH / imgWidth.value);
              }
            } else {
              if ((EDITOR_HEIGHT - imgWidth.value) / 2 > vertical) {
                const proportions =
                  (EDITOR_HEIGHT - 2 * vertical) / imgWidth.value;
                scl.value = withTiming(proportions);
              } else {
                scl.value = withTiming(1);
              }
            }
          } else {
            vertical = 0;
            horizontal =
              (EDITOR_WIDTH -
                (EDITOR_HEIGHT * selectedAspect.x) / selectedAspect.y) /
              2;
            if (rot.value === 0 || rot.value === 3) {
              if ((EDITOR_WIDTH - imgWidth.value) / 2 > horizontal) {
                const proportions =
                  (EDITOR_WIDTH - 2 * horizontal) / imgWidth.value;
                scl.value = withTiming(proportions);
              } else {
                scl.value = withTiming(EDITOR_HEIGHT / imgHeight.value);
              }
            } else {
              scl.value = withTiming(EDITOR_HEIGHT / imgWidth.value);
            }
          }
        } else {
          if (selectedAspect.x > selectedAspect.y) {
            vertical =
              (EDITOR_HEIGHT -
                (EDITOR_WIDTH * selectedAspect.y) / selectedAspect.x) /
              2;
            horizontal = 0;
            if (rot.value === 0 || rot.value === 3) {
              if ((EDITOR_HEIGHT - imgHeight.value) / 2 > vertical) {
                const proportions =
                  (EDITOR_HEIGHT - 2 * vertical) / imgHeight.value;
                scl.value = withTiming(proportions);
              } else {
                scl.value = withTiming(1);
              }
            } else {
              scl.value = withTiming(EDITOR_WIDTH / imgHeight.value);
            }
          } else {
            vertical = 0;
            horizontal =
              (EDITOR_WIDTH -
                (EDITOR_HEIGHT * selectedAspect.x) / selectedAspect.y) /
              2;
            if (rot.value === 0 || rot.value === 3) {
              scl.value = withTiming(EDITOR_HEIGHT / imgHeight.value);
            } else {
              if ((EDITOR_WIDTH - imgHeight.value) / 2 > horizontal) {
                const proportions =
                  (EDITOR_WIDTH - 2 * horizontal) / imgHeight.value;
                scl.value = withTiming(proportions);
              } else {
                scl.value = withTiming(1);
              }
            }
          }
        }
        top.value = withTiming(vertical);
        bottom.value = withTiming(vertical);
        left.value = withTiming(horizontal);
        right.value = withTiming(horizontal);
        setCropView({
          top: vertical,
          bottom: vertical,
          left: horizontal,
          right: horizontal,
        });
        transformX.value = withTiming(0);
        transformY.value = withTiming(0);
      } else {
        resetEditor();
        resizer(counter === 0 ? img : cropImages[counter]);
        aspect.value = 0;
      }
    }, [selectedAspect]);

    const cropItemsPositions = [
      {
        id: 1,
        style: { top: 0, left: 0 },
        onMove: !selectedAspect ? onLTCropHandler : () => {},
      },
      {
        id: 2,
        style: { top: 0, right: 0 },
        onMove: !selectedAspect ? onRTCropHandler : () => {},
      },
      {
        id: 3,
        style: { bottom: 0, right: 0 },
        onMove: !selectedAspect ? onRBCropHandler : () => {},
      },
      {
        id: 4,
        style: { bottom: 0, left: 0 },
        onMove: !selectedAspect ? onLBCropHandler : () => {},
      },
    ];

    const CropItem = (): ReactElement[] => {
      return cropItemsPositions.map(({ id, style, onMove }, index) => {
        return (
          <PanGestureHandler key={id} onGestureEvent={onMove}>
            <Animated.View style={[s.cropItems, style]}>
              <Icon
                styleIcon={{
                  transform: [
                    { rotate: `${index * 90}deg` },
                    { translateX: -16 },
                    { translateY: -16 },
                  ],
                }}
                size={18}
                color={colors.white}
                img={icons.cropItem}
              />
            </Animated.View>
          </PanGestureHandler>
        );
      });
    };

    return (
      <View
        style={[
          s.container,
          selectedColor ? { backgroundColor: selectedColor } : {},
          styleContainer,
        ]}
      >
        <PanGestureHandler maxPointers={1} onGestureEvent={onMoveEvent}>
          <Animated.View
            pointerEvents={cropStarted ? 'none' : undefined}
            style={[sizeStyle, positionStyle]}
          >
            <RotationGestureHandler onGestureEvent={onRotateEvent}>
              <Animated.View
                pointerEvents={transformStarted ? 'none' : undefined}
                style={[s.fullScreen, rotateStyle]}
              >
                <PinchGestureHandler onGestureEvent={onScaleEvent}>
                  <Animated.View
                    pointerEvents={transformStarted ? 'none' : undefined}
                    style={[s.fullScreen, scaleStyle]}
                  >
                    <Animated.Image
                      style={[s.fullScreen]}
                      source={{ uri: cropImages[counter] }}
                    />
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </RotationGestureHandler>
          </Animated.View>
        </PanGestureHandler>

        {selectedBtn === SelectedBtnType.CROP ? (
          <Animated.View
            style={[
              s.cropContainer,
              {
                backgroundColor: cropStarted
                  ? colors.white_01
                  : colors.transparent,
              },
              cropViewStyle,
            ]}
            pointerEvents={'box-none'}
          >
            {cropStarted ? (
              <Image
                resizeMode={'stretch'}
                style={[s.fullScreen, { tintColor: colors.white_05 }]}
                source={images.grid}
              />
            ) : null}
            {CropItem()}
          </Animated.View>
        ) : null}

        <ViewShotWindow
          ref={viewShotRef}
          selectedColor={selectedColor || colors.black}
          viewShotStyle={{
            width: EDITOR_WIDTH - cropView.left - cropView.right,
            height: EDITOR_HEIGHT - cropView.top - cropView.bottom,
          }}
          imageWrapperStyle={[
            { height: imgHeight.value, width: imgWidth.value },
            {
              transform: [
                { translateX: transformX.value },
                { translateY: transformY.value },
              ],
            },
          ]}
          imageStyle={{
            transform: [
              { translateY: (cropView.bottom - cropView.top) / 2 },
              { translateX: (cropView.right - cropView.left) / 2 },
              { rotate: `${rot.value * 60}deg` },
              { scale: scl.value },
            ],
          }}
          image={cropImages[counter]}
        />
      </View>
    );
  }
);
const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    height: EDITOR_HEIGHT,
  },
  fullScreen: {
    height: '100%',
    width: '100%',
  },
  cropContainer: {
    position: 'absolute',
    overflow: 'hidden',
  },
  cropItems: {
    height: 50,
    width: 50,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropItemsPos: {
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
});
