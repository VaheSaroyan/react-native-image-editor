import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { HEIGHT, WIDTH } from '../../../utils/constants';
import ViewShot from 'react-native-view-shot';

type Props = {
  viewShotStyle: ViewStyle;
  imageWrapperStyle: StyleProp<ViewStyle>;
  imageStyle: StyleProp<ImageStyle>;
  image: string;
  selectedColor: string;
};

export type ViewShotRef = {
  capture: () => void;
};

export const ViewShotWindow = forwardRef<ViewShotRef, Props>(
  (
    { viewShotStyle, imageWrapperStyle, imageStyle, image, selectedColor },
    ref
  ) => {
    const viewShotRef = useRef<ViewShot>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        // @ts-ignore
        return await viewShotRef.current?.capture();
      },
    }));
    return (
      <View style={s.container}>
        {/*@ts-ignore*/}
        <ViewShot
          ref={viewShotRef}
          options={{
            format: 'png',
            quality: 1.0,
            result: 'base64',
          }}
          style={{
            backgroundColor: selectedColor,
            ...s.viewShot,
            ...viewShotStyle,
          }}
        >
          <View style={imageWrapperStyle}>
            <Image style={[s.fullScreen, imageStyle]} source={{ uri: image }} />
          </View>
        </ViewShot>
      </View>
    );
  }
);
const s = StyleSheet.create({
  container: {
    width: WIDTH,
    height: HEIGHT,
    position: 'absolute',
    left: -WIDTH,
    overflow: 'hidden',
  },
  viewShot: {
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    height: '100%',
    width: '100%',
  },
});
