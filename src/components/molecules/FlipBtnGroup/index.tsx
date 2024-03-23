import React, { type FC, useRef, useState } from 'react';
import {
  type ImageProps,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Button, Icon } from '../../atoms';
import { BTN_BORDER_RADIUS, BTN_SIZE, IS_IPAD } from '../../../utils/constants';
import { icons } from '../../../assets/icons';
import {
  measureHandler,
  type MeasureType,
} from '../../../utils/measureHandler';
import type { EditorSettingsType } from '@vahesaroyan/react-native-image-editor';
type Props = {
  onPressFlip?: (flip: boolean, type: 'horizontal' | 'vertical') => void;
  editorSettings: EditorSettingsType[];
  iconFlipVertical?: ImageProps['source'];
  iconFlipHorizontal?: ImageProps['source'];
};

export const FlipBtnGroup: FC<Props> = ({
  onPressFlip,
  editorSettings,
  iconFlipVertical,
  iconFlipHorizontal,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [measure, setMeasure] = useState<MeasureType | null>(null);
  const btnRef = useRef<TouchableOpacity>(null);
  const rotate =
    editorSettings[editorSettings?.length - 1]?.rotate === 0 ||
    editorSettings[editorSettings.length - 1]?.rotate === 3;
  return IS_IPAD ? (
    <>
      <Button
        styleContainer={[
          !iconFlipHorizontal ? { transform: [{ rotate: '270deg' }] } : {},
        ]}
        btnIconSize={23}
        onPress={() => {
          onPressFlip &&
            onPressFlip(
              rotate
                ? !editorSettings[editorSettings.length - 1]?.flip.horizontal
                : !editorSettings[editorSettings.length - 1]?.flip.vertical,
              'horizontal'
            );
        }}
        btnIcon={iconFlipHorizontal || icons.flip}
      />
      <Button
        btnIconSize={23}
        onPress={() => {
          onPressFlip &&
            onPressFlip(
              rotate
                ? !editorSettings[editorSettings.length - 1]?.flip.vertical
                : !editorSettings[editorSettings.length - 1]?.flip.horizontal,
              'vertical'
            );
        }}
        btnIcon={iconFlipVertical || icons.flip}
      />
    </>
  ) : (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        ref={btnRef}
        style={[
          s.flipBtn,
          !iconFlipHorizontal ? { transform: [{ rotate: '270deg' }] } : {},
        ]}
        onPress={() => {
          measureHandler(btnRef, setMeasure);
          setModalOpen(!modalOpen);
        }}
      >
        <Icon
          img={iconFlipHorizontal || icons.flip}
          size={23}
          color={colors.white}
        />
      </TouchableOpacity>
      <Modal visible={modalOpen} animationType={'fade'} transparent>
        <View style={s.modal}>
          <Pressable
            onPress={() => setModalOpen(false)}
            style={s.modalOverlay}
          />
          <View
            style={[
              s.btnGroupContainer,
              measure
                ? {
                    top: measure.py + 50,
                    left: -3,
                  }
                : {},
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                onPressFlip &&
                  onPressFlip(
                    rotate
                      ? !editorSettings[editorSettings.length - 1]?.flip
                          .horizontal
                      : !editorSettings[editorSettings.length - 1]?.flip
                          .vertical,
                    'horizontal'
                  );
              }}
              activeOpacity={0.7}
              style={[s.rowWrapper, s.justifyStart, s.marginBottom8]}
            >
              <Icon
                styleContainer={
                  !iconFlipHorizontal
                    ? { transform: [{ rotate: '270deg' }] }
                    : {}
                }
                size={23}
                color={colors.white}
                img={iconFlipHorizontal || icons.flip}
              />
              <AppText style={s.btnLabel}>Horizontal</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onPressFlip &&
                  onPressFlip(
                    rotate
                      ? !editorSettings[editorSettings.length - 1]?.flip
                          .vertical
                      : !editorSettings[editorSettings.length - 1]?.flip
                          .horizontal,
                    'vertical'
                  );
              }}
              activeOpacity={0.7}
              style={[s.rowWrapper, s.justifyStart]}
            >
              <Icon
                size={23}
                color={colors.white}
                img={iconFlipHorizontal || icons.flip}
              />
              <AppText style={s.btnLabel}>Vertical</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};
const s = StyleSheet.create({
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flipBtn: {
    borderRadius: BTN_BORDER_RADIUS,
    height: BTN_SIZE,
    width: BTN_SIZE,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.black_01,
  },
  btnGroupContainer: {
    backgroundColor: colors.gray,
    borderRadius: BTN_BORDER_RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 16.5,
    marginLeft: 10,
  },
  justifyStart: { justifyContent: 'flex-start' },
  marginBottom8: { marginBottom: 8 },
});
