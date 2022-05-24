import React, { useState, FC } from 'react';
import {
  ImageProps,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { Button } from '../../atoms';
import { BTN_BORDER_RADIUS } from '../../../utils/constants';
import { icons } from '../../../assets/icons';
type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  onPressRotate?: () => void;
  onPressRedo?: () => void;
  onPressUndo?: () => void;
  onPressReset?: () => void;
  iconCrop?: ImageProps['source'];
  iconPalette?: ImageProps['source'];
  iconRotate?: ImageProps['source'];
  iconRedo?: ImageProps['source'];
  iconUndo?: ImageProps['source'];
  iconReset?: ImageProps['source'];
  setSelectedBtn: (btnMame: SelectedBtnType) => void;
  selectedBtn: SelectedBtnType;
  counter: number;
  cropImages: string[];
};

export const enum SelectedBtnType {
  CROP = 'Crop',
  PALETTE = 'Palette',
  NONE = '',
}

export const BtnGroup: FC<Props> = ({
  styleContainer,
  onPressRotate,
  onPressRedo,
  onPressUndo,
  onPressReset,
  iconCrop,
  iconPalette,
  iconRotate,
  iconRedo,
  iconUndo,
  iconReset,
  setSelectedBtn,
  selectedBtn,
  counter,
  cropImages,
}) => {
  const [rotateBtnDisabled, setRotateBtnDisabled] = useState(false);
  const onPressBtnHandler = (name: SelectedBtnType): void => {
    if (selectedBtn === name) {
      setSelectedBtn(SelectedBtnType.NONE);
    } else {
      setSelectedBtn(name);
    }
  };
  return (
    <View style={[s.container, s.rowWrapper, styleContainer]}>
      <View style={[s.rowWrapper, s.btnGroupWrapper]}>
        <Button
          selected={selectedBtn === SelectedBtnType.CROP}
          onPress={() => onPressBtnHandler(SelectedBtnType.CROP)}
          btnIcon={iconCrop || icons.crop}
        />
        <Button
          selected={selectedBtn === SelectedBtnType.PALETTE}
          onPress={() => onPressBtnHandler(SelectedBtnType.PALETTE)}
          btnIcon={iconPalette || icons.palette}
        />
      </View>
      <Button
        styleContainer={[
          selectedBtn !== SelectedBtnType.NONE
            ? { backgroundColor: colors.transparent }
            : {},
          !iconRotate ? { transform: [{ scaleX: -1 }] } : {},
        ]}
        disabled={rotateBtnDisabled || selectedBtn !== SelectedBtnType.NONE}
        btnIconSize={21}
        onPress={() => {
          if (selectedBtn === SelectedBtnType.NONE) {
            onPressRotate && onPressRotate();
            setRotateBtnDisabled(true);
            setTimeout(() => {
              setRotateBtnDisabled(false);
            }, 500);
          }
        }}
        btnIcon={iconRotate || icons.rotate}
      />
      <Button
        styleContainer={
          counter === cropImages.length - 1 || cropImages.length === 0
            ? { backgroundColor: colors.transparent }
            : {}
        }
        disabled={counter === cropImages.length - 1 || cropImages.length === 0}
        btnIconSize={20}
        btnText="Redo"
        onPress={onPressRedo}
        btnIcon={iconRedo || icons.redo}
      />
      <Button
        styleContainer={[
          counter === 0 || cropImages.length === 0
            ? { backgroundColor: colors.transparent }
            : {},
        ]}
        disabled={counter === 0 || cropImages.length === 0}
        btnIconSize={20}
        btnText="Undo"
        onPress={onPressUndo}
        btnIcon={iconUndo || icons.undo}
      />
      <Button
        btnIconSize={17}
        btnText="Reset"
        onPress={onPressReset}
        btnIcon={iconReset || icons.reset}
      />
    </View>
  );
};
const s = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    width: '100%',
    backgroundColor: colors.transparent,
    height: 'auto',
  },
  btnGroupWrapper: {
    backgroundColor: colors.gray,
    borderRadius: BTN_BORDER_RADIUS,
    // pointerEvents: 'none',
  },
});
