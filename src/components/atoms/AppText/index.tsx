import React from 'react';
import { Text, type TextProps } from 'react-native';

interface Props extends TextProps {}
export const AppText: React.FC<Props> = ({ children, ...textProps }) => {
  return (
    <Text allowFontScaling={false} {...textProps}>
      {children}
    </Text>
  );
};
