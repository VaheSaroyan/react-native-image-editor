import React from 'react';
import {
  Image,
  type ImageProps,
  type ImageStyle,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { BTN_ICON_HEIGHT } from '../../../utils/constants';
interface Props {
  img: ImageProps['source'];
  size?: number;
  height?: number;
  width?: number;
  color?: string;
  styleContainer?: StyleProp<ViewStyle>;
  styleIcon?: StyleProp<ImageStyle>;
}

export const Icon: React.FC<Props> = ({
  img,
  size,
  height,
  width,
  styleContainer,
  styleIcon,
  color,
}) => {
  return (
    <View style={[s.container, styleContainer]}>
      <Image
        resizeMode={'contain'}
        style={[
          { height, width },
          size ? { height: size, width: size } : {},
          { tintColor: color },
          styleIcon,
        ]}
        source={img}
      />
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BTN_ICON_HEIGHT,
  },
});
