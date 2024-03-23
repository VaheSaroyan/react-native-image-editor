import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '../../../assets/colors';
import Animated from 'react-native-reanimated';
import { Icon } from '../../atoms';
import { icons } from '../../../assets/icons';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
type Props = {
  topLeft: (() => void) | any;
  topRight: (() => void) | any;
  bottomLeft: (() => void) | any;
  bottomRight: (() => void) | any;
};
export const CropItems: React.FC<Props> = ({
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
}) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PanGestureHandler onGestureEvent={topLeft}>
        <Animated.View style={[s.cropItems, s.topLeft]}>
          <Icon
            styleIcon={[s.topLeftIcon]}
            size={18}
            color={colors.white}
            img={icons.cropItem}
          />
        </Animated.View>
      </PanGestureHandler>
      <PanGestureHandler onGestureEvent={topRight}>
        <Animated.View style={[s.cropItems, s.topRight]}>
          <Icon
            styleIcon={[s.topRightIcon]}
            size={18}
            color={colors.white}
            img={icons.cropItem}
          />
        </Animated.View>
      </PanGestureHandler>
      <PanGestureHandler onGestureEvent={bottomRight}>
        <Animated.View style={[s.cropItems, s.bottomRight]}>
          <Icon
            styleIcon={[s.bottomRightIcon]}
            size={18}
            color={colors.white}
            img={icons.cropItem}
          />
        </Animated.View>
      </PanGestureHandler>
      <PanGestureHandler onGestureEvent={bottomLeft}>
        <Animated.View style={[s.cropItems, s.bottomLeft]}>
          <Icon
            styleIcon={[s.bottomLeftIcon]}
            size={18}
            color={colors.white}
            img={icons.cropItem}
          />
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};
const s = StyleSheet.create({
  cropItems: {
    height: 50,
    width: 50,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topLeft: { top: 0, left: 0 },
  topLeftIcon: {
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  topRight: { top: 0, right: 0 },
  topRightIcon: {
    transform: [{ rotate: '90deg' }, { translateX: -16 }, { translateY: -16 }],
  },
  bottomRight: { bottom: 0, right: 0 },
  bottomRightIcon: {
    transform: [{ rotate: '180deg' }, { translateX: -16 }, { translateY: -16 }],
  },
  bottomLeft: { bottom: 0, left: 0 },
  bottomLeftIcon: {
    transform: [{ rotate: '270deg' }, { translateX: -16 }, { translateY: -16 }],
  },
});
