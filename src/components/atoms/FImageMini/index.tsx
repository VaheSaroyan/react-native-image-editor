import React from 'react';
import {StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {colors} from '../../../assets/colors';

interface Props {
  image: string;
  selected: boolean;
}
export const FImageMini: React.FC<Props> = ({image, selected}) => {
  return (
    <View style={[s.fullScreen, selected ? s.selected : {}]}>
      <FastImage
        style={s.fullScreen}
        source={{
          uri: image,
          priority: FastImage.priority.high,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
    </View>
  );
};
const s = StyleSheet.create({
  fullScreen: {
    height: '100%',
    width: '100%',
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.white,
  },
});
