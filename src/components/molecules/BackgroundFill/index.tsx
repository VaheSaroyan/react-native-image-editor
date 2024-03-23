import React from 'react';
import {
  type ImageStyle,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';
type Props = {
  top: AnimatedStyle<ViewStyle | ImageStyle | TextStyle>;
  bottom: AnimatedStyle<ViewStyle | ImageStyle | TextStyle>;
  left: AnimatedStyle<ViewStyle | ImageStyle | TextStyle>;
  right: AnimatedStyle<ViewStyle | ImageStyle | TextStyle>;
};
export const BackgroundFill: React.FC<Props> = ({
  top,
  bottom,
  left,
  right,
}) => {
  return (
    <>
      <Animated.View style={[s.topLeft, s.block, top]} />
      <Animated.View style={[s.bottomLeft, s.block, bottom]} />
      <Animated.View style={[s.leftTop, s.block, left]} />
      <Animated.View style={[s.rightTop, s.block, right]} />
    </>
  );
};
const s = StyleSheet.create({
  block: {
    position: 'absolute',
    backgroundColor: colors.black,
  },
  topLeft: { width: '100%', top: 0, left: 0 },
  bottomLeft: { width: '100%', bottom: 0, left: 0 },
  leftTop: { height: '100%', left: 0, top: 0 },
  rightTop: { height: '100%', right: 0, top: 0 },
});
