import React, { useEffect, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  Pressable,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { MeasureType } from '../../../utils/measureHandler';
import { measureHandler } from '../../../utils/measureHandler';
import { colors } from '../../../assets/colors';
import { IS_IPAD } from '../../../utils/constants';
import { AppText } from '../AppText';

interface Props {
  styleContainer?: StyleProp<ViewStyle>;
  sliderValue: number;
  setSliderValue: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  disabled?: boolean;
}
const SLIDER_SIZE = IS_IPAD ? 34.5 : 30;
const DEVIATION = 0.45;

export const Slider: React.FC<Props> = ({
  styleContainer,
  sliderValue,
  setSliderValue,
  disabled,
  maximumValue = 50,
}) => {
  const [measure, setMeasure] = useState<MeasureType | null>(null);
  const boxRef = useRef(null);
  const transformX = useSharedValue(0);
  const boxWidth = useSharedValue(0);
  const proportion = useSharedValue(0);
  const borderWidthSetter = (trX: number): void => {
    let x = trX;
    if (trX < 0) {
      x = 0;
    } else if (x > boxWidth.value) {
      x = boxWidth.value;
    }
    setSliderValue(Math.round(x / proportion.value));
  };

  const onMoveEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { transformX: number; boxWidth: number }
  >({
    onStart: (_, ctx) => {
      ctx.transformX = transformX.value;
    },
    onActive: (event, ctx) => {
      const x = ctx.transformX + event.translationX;
      if (x >= -DEVIATION && x <= boxWidth.value + DEVIATION) {
        transformX.value = x;
        runOnJS(borderWidthSetter)(x);
      }
    },
  });

  const onSliderPressHandler = (e: GestureResponderEvent): void => {
    const x = e.nativeEvent.locationX;
    let transformValue = x;
    if (x < 0) {
      transformValue = 0;
    } else if (x > boxWidth.value) {
      transformValue = boxWidth.value;
    }
    transformX.value = withTiming(transformValue, { duration: 200 });
    setSliderValue(Math.round(transformValue / proportion.value));
  };

  const transformStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: transformX.value }] };
  });

  const activeSliderWidthStyle = useAnimatedStyle(() => {
    return { width: transformX.value + SLIDER_SIZE / 2 };
  });

  const unActiveSliderWidthStyle = useAnimatedStyle(() => {
    return { width: boxWidth.value + SLIDER_SIZE / 2 - transformX.value };
  });

  useEffect(() => {
    if (boxRef !== null) {
      measureHandler(boxRef, setMeasure);
    }
  }, [boxRef]);

  useEffect(() => {
    if (measure?.width) {
      boxWidth.value = measure?.width;
      const p = measure?.width / maximumValue;
      proportion.value = p;
      transformX.value = sliderValue * p || 0;
    }
    if (measure?.width === 0) {
      measureHandler(boxRef, setMeasure);
    }
  }, [measure]);

  return (
    <GestureHandlerRootView style={[s.container, styleContainer]}>
      <Pressable
        onPress={(e) => !disabled && onSliderPressHandler(e)}
        ref={boxRef}
        style={s.sliderContainer}
      >
        <Animated.View
          pointerEvents={'none'}
          style={[
            s.sliderBlock,
            s.activeSliderBlock,
            disabled
              ? { backgroundColor: colors.gray_dark_2 }
              : { backgroundColor: colors.pink },
            activeSliderWidthStyle,
          ]}
        />
        <Animated.View
          pointerEvents={'none'}
          style={[
            s.sliderBlock,
            s.unActiveSliderBlock,
            disabled
              ? { backgroundColor: colors.gray_dark_2 }
              : { backgroundColor: colors.white_02 },
            unActiveSliderWidthStyle,
          ]}
        />
      </Pressable>
      <PanGestureHandler maxPointers={1} onGestureEvent={onMoveEvent}>
        <Animated.View
          style={[
            s.sliderCircle,
            disabled
              ? { backgroundColor: colors.gray }
              : { backgroundColor: colors.white },
            transformStyle,
          ]}
        >
          <AppText
            style={[
              s.sliderCircleText,
              { color: disabled ? colors.gray_dark : colors.pink },
            ]}
          >
            {sliderValue}
          </AppText>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const s = StyleSheet.create({
  container: {
    height: IS_IPAD ? 41.5 : 36,
    width: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sliderContainer: {
    position: 'absolute',
    top: 0,
    left: SLIDER_SIZE / 2,
    bottom: 0,
    right: SLIDER_SIZE / 2,
    justifyContent: 'center',
  },
  sliderBlock: {
    height: IS_IPAD ? 11.5 : 10,
    borderRadius: 50,
  },
  activeSliderBlock: {
    position: 'absolute',
    left: -3,
  },
  unActiveSliderBlock: {
    position: 'absolute',
    right: -3,
  },
  sliderCircle: {
    height: SLIDER_SIZE,
    width: SLIDER_SIZE,
    borderRadius: SLIDER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderCircleText: {
    fontWeight: '900',
    fontSize: IS_IPAD ? 17 : 15,
  },
});
