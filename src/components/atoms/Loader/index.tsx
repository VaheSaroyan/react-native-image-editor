import React from 'react';
import {StyleSheet, View} from 'react-native';
import Animated from 'react-native-reanimated';
import {AppText} from '../AppText';
import {colors} from '../../../assets/colors';
import {EDITOR_WIDTH, IS_IPAD} from '../../../utils/constants';

interface Props {
  opacityStyle: {opacity: number};
  widthStyle: {width: string};
}
export const Loader: React.FC<Props> = ({opacityStyle, widthStyle}) => {
  return (
    <Animated.View style={[s.loaderContainer, opacityStyle]}>
      <AppText style={s.loaderText}>Loading...</AppText>
      <View style={s.loaderSliderWrapper}>
        <Animated.View
          style={[s.loaderSlider, widthStyle as {width: `${number}%`}]}
        />
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  loaderText: {
    color: colors.white,
    lineHeight: !IS_IPAD ? 45 : 50,
    fontSize: !IS_IPAD ? 20 : 24,
    fontWeight: 'bold',
  },
  loaderSliderWrapper: {
    backgroundColor: colors.white_02,
    height: 8,
    width: !IS_IPAD ? EDITOR_WIDTH / 1.5 : EDITOR_WIDTH / 2.5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  loaderSlider: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: 10,
  },
});
