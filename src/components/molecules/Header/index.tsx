import React from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Button } from '../../atoms';
import { icons } from '../../../assets/icons';
type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  onPressGoBack?: () => void;
  editorTitle?: string;
};
export const Header: React.FC<Props> = ({
  styleContainer,
  onPressGoBack,
  editorTitle,
}) => {
  return (
    <View style={[s.container, styleContainer]}>
      <Button
        btnIconSize={13}
        onPress={onPressGoBack}
        styleContainer={s.btn}
        btnIcon={icons.arrow}
      />
      <AppText style={s.title}>{editorTitle || 'image editor'}</AppText>
    </View>
  );
};
const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: colors.transparent,
    height: 45,
  },
  btn: {
    position: 'absolute',
    left: 0,
    height: 45,
    width: 45,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
