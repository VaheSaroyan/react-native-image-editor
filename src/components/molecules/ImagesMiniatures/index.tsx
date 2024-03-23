import React, { type FC } from 'react';
import {
  FlatList,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { FImageMini } from '../../atoms';
import { IS_IPAD } from '../../../utils/constants';
type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  data: string[];
  selectedIndex: number;
  // setSelectedAspect: (selectedAspect: null) => void;
  setSelectedIndex: (index: number) => void;
};

export const ImagesMiniatures: FC<Props> = ({
  styleContainer,
  data,
  selectedIndex,
  // setSelectedAspect,
  setSelectedIndex,
}) => {
  return (
    <View style={[s.container, styleContainer]}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `${index}`}
        data={data}
        initialNumToRender={6}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setSelectedIndex(index);
              // setSelectedAspect(null);
            }}
            style={[
              s.imageWrapper,
              index === 0 ? (!IS_IPAD ? s.marginLeft2 : s.marginLeft4) : {},
              index === data.length - 1
                ? !IS_IPAD
                  ? s.marginRight2
                  : s.marginRight4
                : {},
            ]}
          >
            <FImageMini selected={selectedIndex === index} image={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
const s = StyleSheet.create({
  container: {
    height: !IS_IPAD ? 48 : 76,
    maxWidth: !IS_IPAD ? 160 : 250,
    alignSelf: 'center',
    backgroundColor: colors.gray,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: !IS_IPAD ? 2 : 4,
  },
  imageWrapper: {
    height: !IS_IPAD ? 44 : 68,
    width: !IS_IPAD ? 35 : 55,
    marginHorizontal: !IS_IPAD ? 1 : 2,
    borderRadius: 3,
    overflow: 'hidden',
  },
  marginLeft2: {
    marginLeft: 2,
  },
  marginRight2: {
    marginRight: 2,
  },
  marginLeft4: {
    marginLeft: 4,
  },
  marginRight4: {
    marginRight: 4,
  },
});
