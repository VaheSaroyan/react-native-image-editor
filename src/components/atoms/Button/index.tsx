import React, { type FC } from 'react';
import {
  type ImageProps,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Icon } from '../index';
import { BTN_BORDER_RADIUS, BTN_SIZE } from '../../../utils/constants';

interface Props extends TouchableOpacityProps {
  styleContainer?: StyleProp<ViewStyle>;
  btnText?: string;
  btnIcon: ImageProps['source'];
  selected?: boolean;
  btnIconSize?: number;
}
export const Button: FC<Props> = ({
  styleContainer,
  btnText,
  btnIcon,
  btnIconSize,
  selected,
  ...touchableProps
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        s.container,
        selected ? { backgroundColor: colors.pink } : {},
        styleContainer,
      ]}
      {...touchableProps}
    >
      <Icon img={btnIcon} size={btnIconSize || 22} color={colors.white} />
      {btnText ? <AppText style={s.text}>{btnText}</AppText> : null}
    </TouchableOpacity>
  );
};

const s = StyleSheet.create({
  container: {
    borderRadius: BTN_BORDER_RADIUS,
    height: BTN_SIZE,
    width: BTN_SIZE,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedContainer: {
    backgroundColor: colors.pink,
  },
  text: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 12,
    fontWeight: '600',
  },
});
