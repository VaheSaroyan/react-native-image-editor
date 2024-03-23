import React, { useState, type FC, useEffect, useMemo } from 'react';
import {
  type ColorValue,
  FlatList,
  Modal,
  Pressable,
  type StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Icon, Slider } from '../../atoms';
import type { aspectType } from '../../organizm';
import {
  BORDER_MAX_WIDTH,
  IS_IPAD,
  PALETTE_COLORS,
  WIDTH,
} from '../../../utils/constants';
import { icons } from '../../../assets/icons';

const PADDING_HORIZONTAL = !IS_IPAD ? 16 : 24;
const COLOR_SIZE = !IS_IPAD
  ? (WIDTH - 3 * PADDING_HORIZONTAL) / 12
  : (WIDTH * 0.69999995 - 3 * PADDING_HORIZONTAL) / 12;

const enum SelectedBtnType {
  CROP = 'Crop',
  PALETTE = 'Palette',
}

type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  setModalOpen: (status: boolean) => void;
  modalOpen: boolean;
  data: aspectType[];
  selectedAspect: aspectType | null;
  setSelectedAspect: (aspect: aspectType | null) => void;
  type: any;
  aspectRatioBtnText?: string;
  backgroundColorBtnText?: string;
  onPressAspect?: (aspect: aspectType | null) => void;
  onPressPalette?: (aspect: { color: string; width: number } | null) => void;
  paletteValue: { color: string; width: number } | null;
};

export const ModalComponent: FC<Props> = ({
  styleContainer,
  modalOpen,
  data,
  setModalOpen,
  selectedAspect,
  setSelectedAspect,
  type,
  aspectRatioBtnText,
  backgroundColorBtnText,
  onPressAspect,
  onPressPalette,
  paletteValue,
}) => {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(0);

  const initFrameColor = (): void => {
    const isHaveValues = !!paletteValue?.width && !!paletteValue?.color;
    setSliderValue(isHaveValues ? paletteValue?.width : 0);
    setSelectedColor(isHaveValues ? paletteValue?.color : null);
  };

  useEffect(() => {
    initFrameColor();
  }, [paletteValue]);

  const renderInfo = useMemo(
    () =>
      type === SelectedBtnType.CROP
        ? {
            icon: icons.aspect,
            title: aspectRatioBtnText || 'Select Aspect Ratio',
          }
        : {
            icon: icons.palette,
            title: backgroundColorBtnText || 'Select Frame Color',
          },
    [aspectRatioBtnText, backgroundColorBtnText, type]
  );

  return (
    <>
      <Modal
        animationType={!IS_IPAD ? 'slide' : 'fade'}
        transparent
        visible={modalOpen}
      >
        <View style={[s.modal]}>
          <Pressable
            onPress={() => {
              type === SelectedBtnType.PALETTE && initFrameColor();
              setModalOpen(false);
            }}
            style={s.touchableOverlay}
          />
          <View
            style={[
              s.container,
              IS_IPAD ? s.containerIpad : {},
              styleContainer,
            ]}
          >
            <View style={[s.rowWrapper, s.header]}>
              <View style={[s.rowWrapper, s.justifyStart]}>
                <Icon
                  styleContainer={s.aspectIconContainer}
                  color={colors.white}
                  size={22}
                  img={renderInfo.icon}
                />
                <View>
                  <AppText
                    numberOfLines={1}
                    style={[s.text, s.fz15, s.maxWidthText]}
                  >
                    {renderInfo.title}
                  </AppText>
                  <AppText style={[s.text, s.fz13]}>
                    Single Cast Actions
                  </AppText>
                </View>
              </View>
              <Pressable
                style={s.iconWrapper}
                onPress={() => {
                  type === SelectedBtnType.PALETTE && initFrameColor();
                  setModalOpen(false);
                }}
              >
                <Icon
                  styleContainer={s.crossIconContainer}
                  size={12}
                  img={icons.cross}
                />
              </Pressable>
            </View>
            <View style={s.contentContainer}>
              {type === SelectedBtnType.CROP ? (
                <View style={s.aspectItemsWrapper}>
                  <FlatList
                    data={data}
                    scrollEnabled={data.length > 6}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          s.rowWrapper,
                          s.aspectItem,
                          index !== data.length - 1
                            ? {
                                borderBottomWidth: 1,
                                borderBottomColor: colors.white_01,
                              }
                            : {},
                        ]}
                        onPress={() => {
                          if (selectedAspect?.id === item?.id) {
                            setSelectedAspect(null);
                            onPressAspect && onPressAspect(null);
                          } else {
                            setSelectedAspect(item);
                            onPressAspect && onPressAspect(item);
                          }
                          setModalOpen(!modalOpen);
                        }}
                      >
                        <AppText style={[s.text, s.fz17]}>{item.name}</AppText>
                        {selectedAspect && selectedAspect.id === item.id ? (
                          <Icon
                            styleContainer={s.checkIconContainer}
                            color={colors.white}
                            size={14}
                            img={icons.check}
                          />
                        ) : null}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              ) : (
                <>
                  <View
                    style={[
                      s.rowWrapper,
                      s.colorItemsWrapper,
                      { paddingHorizontal: PADDING_HORIZONTAL / 2 },
                    ]}
                  >
                    {PALETTE_COLORS.map((col) => (
                      <Pressable
                        key={col.id}
                        onPress={() => {
                          setSelectedColor(
                            col.value === selectedColor ? null : col.value
                          );
                        }}
                        style={[
                          {
                            height: COLOR_SIZE,
                            width: COLOR_SIZE,
                            backgroundColor: col.value as ColorValue,
                            transform: [{ scale: 1.02 }],
                          },
                          selectedColor === col.value ? s.zIndex100 : {},
                        ]}
                      >
                        <View
                          style={
                            selectedColor === col.value ? s.colorItemBorder : {}
                          }
                        />
                      </Pressable>
                    ))}
                  </View>
                  <Slider
                    maximumValue={BORDER_MAX_WIDTH}
                    styleContainer={s.slider}
                    disabled={selectedColor === null}
                    {...{ sliderValue, setSliderValue }}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setModalOpen(!modalOpen);
                      if (onPressPalette) {
                        if (selectedColor) {
                          onPressPalette({
                            color: selectedColor,
                            width: sliderValue,
                          });
                        } else {
                          onPressPalette(null);
                        }
                      }
                    }}
                    style={[s.saveBtnContainer]}
                  >
                    <AppText style={[s.text, s.fz16]}>Save</AppText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
const s = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: !IS_IPAD ? 'flex-end' : 'center',
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    margin: -10,
    padding: 10,
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  container: {
    width: '100%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  containerIpad: {
    borderRadius: 13,
    overflow: 'hidden',
    width: '70%',
  },
  header: {
    backgroundColor: colors.black,
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  aspectIconContainer: {
    backgroundColor: colors.pink,
    height: 40,
    width: 40,
    borderRadius: 5,
    marginRight: 10,
  },
  crossIconContainer: {
    backgroundColor: colors.gray_dark,
    height: 30,
    width: 30,
    borderRadius: 30,
  },
  contentContainer: {
    backgroundColor: colors.gray_dark,
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 45,
    paddingTop: 25,
  },
  aspectItemsWrapper: {
    backgroundColor: colors.gray_dark_2,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: 300,
  },
  aspectItem: {
    height: 50,
    paddingHorizontal: 16,
  },
  text: {
    color: colors.white,
    fontWeight: '400',
  },
  maxWidthText: {
    maxWidth: WIDTH - 120,
  },
  fz17: { fontSize: 17 },
  fz16: { fontSize: 16 },
  fz15: { fontSize: 15 },
  fz13: { fontSize: 13 },
  checkIconContainer: {
    height: 24,
    width: 24,
    borderRadius: 24,
    backgroundColor: colors.pink,
  },
  colorItemsWrapper: {
    flexWrap: 'wrap',
  },
  colorItemBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1000,
    height: COLOR_SIZE,
    width: COLOR_SIZE,
    borderWidth: 2,
    borderColor: colors.white,
    borderRadius: 5,
    transform: [{ scale: 1.1 }],
  },
  zIndex100: { zIndex: 100 },
  saveBtnContainer: {
    alignSelf: 'center',
    width: !IS_IPAD ? WIDTH - 6.5 * PADDING_HORIZONTAL : '96%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: colors.pink,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  slider: {
    marginVertical: IS_IPAD ? 15 : 10,
    width: '96%',
    alignSelf: 'center',
  },
  touchableOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: IS_IPAD ? colors.black_05 : colors.transparent,
  },
});
