import React, { type FC } from 'react';
import {
  type ImageProps,
  type StyleProp,
  type ViewStyle,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { Button } from '../../atoms';
import {
  BTN_BORDER_RADIUS,
  HEIGHT,
  IS_IPAD,
  WIDTH,
} from '../../../utils/constants';
import { icons } from '../../../assets/icons';
import { FlipBtnGroup } from '../FlipBtnGroup';
import {
  type EditorSettingsType,
  type SettingsType,
} from '@vahesaroyan/react-native-image-editor';
type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  onPressCrop?: () => void;
  onPressRotate?: () => void;
  onPressRedo?: () => void;
  onPressUndo?: () => void;
  onPressReset?: () => void;
  onPressFlip?: (flip: boolean, type: 'horizontal' | 'vertical') => void;
  iconCrop?: ImageProps['source'];
  iconPalette?: ImageProps['source'];
  iconRotate?: ImageProps['source'];
  iconRedo?: ImageProps['source'];
  iconUndo?: ImageProps['source'];
  iconReset?: ImageProps['source'];
  iconFlipVertical?: ImageProps['source'];
  iconFlipHorizontal?: ImageProps['source'];
  setSelectedBtn: (btnMame: SelectedBtnType) => void;
  selectedBtn: SelectedBtnType;
  counter: number;
  imageSettings: SettingsType[];
  editorSettings: EditorSettingsType[];
};
export enum SelectedBtnType {
  CROP = 'Crop',
  PALETTE = 'Palette',
  NONE = '',
}
export const BtnGroup: FC<Props> = ({
  styleContainer,
  onPressCrop,
  onPressFlip,
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
  iconFlipHorizontal,
  iconFlipVertical,
  setSelectedBtn,
  selectedBtn,
  counter,
  imageSettings,
  editorSettings,
}) => {
  const onPressBtnHandler = (name: SelectedBtnType): void => {
    if (selectedBtn === name) {
      setSelectedBtn(SelectedBtnType.NONE);
    } else {
      setSelectedBtn(name);
    }
  };
  return (
    <View
      style={[
        s.container,
        !IS_IPAD ? s.rowWrapper : s.ipadContainer,
        styleContainer,
      ]}
    >
      <View style={[!IS_IPAD ? s.rowWrapper : {}, s.btnGroupWrapper]}>
        <Button
          selected={selectedBtn === SelectedBtnType.CROP}
          onPress={() => {
            onPressBtnHandler(SelectedBtnType.CROP);
            onPressCrop && onPressCrop();
          }}
          btnIcon={iconCrop || icons.crop}
        />
        <Button
          selected={selectedBtn === SelectedBtnType.PALETTE}
          onPress={() => {
            onPressBtnHandler(SelectedBtnType.PALETTE);
          }}
          btnIcon={iconPalette || icons.palette}
        />
      </View>
      <Button
        styleContainer={[!iconRotate ? { transform: [{ scaleX: -1 }] } : {}]}
        btnIconSize={21}
        onPress={() => {
          onPressRotate && onPressRotate();
        }}
        btnIcon={iconRotate || icons.rotate}
      />
      <FlipBtnGroup
        {...{
          onPressFlip,
          editorSettings,
          iconFlipHorizontal,
          iconFlipVertical,
        }}
      />
      <Button
        styleContainer={
          counter === imageSettings?.length - 1 || imageSettings?.length === 0
            ? { backgroundColor: colors.transparent }
            : {}
        }
        disabled={
          counter === imageSettings?.length - 1 || imageSettings?.length === 0
        }
        btnIconSize={20}
        btnText="Redo"
        onPress={onPressRedo}
        btnIcon={iconRedo || icons.redo}
      />
      <Button
        styleContainer={[
          counter === 0 || imageSettings?.length === 0
            ? { backgroundColor: colors.transparent }
            : {},
        ]}
        disabled={counter === 0 || imageSettings?.length === 0}
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
  ipadContainer: {
    position: 'absolute',
    width: 'auto',
    height: 450,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    top: HEIGHT / 2 - 235,
    left: WIDTH * 0.035,
  },
  btnGroupWrapper: {
    backgroundColor: colors.gray,
    borderRadius: BTN_BORDER_RADIUS,
  },
});
