import React, { useEffect, useState, FC } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Icon } from '../../atoms';
import type { aspectType } from '../../organizm';
import { SelectedBtnType } from '../BtnGroup';
import { COLORS, WIDTH } from '../../../utils/constants';
import { icons } from '../../../assets/icons';

type Props = {
  styleContainer?: StyleProp<ViewStyle>;
  setModalOpen: (status: boolean) => void;
  modalOpen: boolean;
  data: aspectType[];
  selectedAspect: aspectType | null;
  setSelectedAspect: (aspect: aspectType | null) => void;
  selectedColor: string | null;
  setSelectedColor: (colorId: string | null) => void;
  type: SelectedBtnType;
  aspectRatioBtnText?: string;
  backgroundColorBtnText?: string;
};
const PADDING_HORIZONTAL = 16;
const COLOR_SIZE = (WIDTH - 3 * PADDING_HORIZONTAL) / 12;
export const ModalComponent: FC<Props> = ({
  styleContainer,
  modalOpen,
  data,
  setModalOpen,
  selectedAspect,
  setSelectedAspect,
  selectedColor,
  setSelectedColor,
  type,
  aspectRatioBtnText,
  backgroundColorBtnText,
}) => {
  const [selectedColorLocal, setSelectedColorLocal] = useState(selectedColor);
  const renderInfo =
    type === SelectedBtnType.CROP
      ? {
          icon: icons.aspect,
          title: aspectRatioBtnText || 'Select Aspect Ratio',
        }
      : {
          icon: icons.palette,
          title: backgroundColorBtnText || 'Select Background Color',
        };
  useEffect(() => {
    if (!selectedColor) {
      setSelectedColorLocal(null);
    }
  }, [selectedColor]);

  return (
    <Modal animationType="slide" transparent visible={modalOpen}>
      <View style={s.modal}>
        <View style={[s.container, styleContainer]}>
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
                <AppText style={[s.text, s.fz13]}>Single Cast Actions</AppText>
              </View>
            </View>
            <Pressable
              style={s.iconWrapper}
              onPress={() => setModalOpen(!modalOpen)}
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
                        setModalOpen(!modalOpen);
                        if (selectedAspect?.id === item?.id) {
                          setSelectedAspect(null);
                        } else {
                          setSelectedAspect(item);
                        }
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
                  {COLORS.map((col) => (
                    <Pressable
                      key={col.id}
                      onPress={() => setSelectedColorLocal(col.value)}
                      style={[
                        {
                          height: COLOR_SIZE,
                          width: COLOR_SIZE,
                          backgroundColor: col.value,
                          transform: [{ scale: 1.02 }],
                        },
                        selectedColorLocal === col.value ? s.zIndex100 : {},
                      ]}
                    >
                      <View
                        style={
                          selectedColorLocal === col.value
                            ? s.colorItemBorder
                            : {}
                        }
                      ></View>
                    </Pressable>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedColor(selectedColorLocal);
                    setModalOpen(!modalOpen);
                  }}
                  style={s.saveBtnContainer}
                >
                  <AppText style={[s.text, s.fz16]}>Save</AppText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};
const s = StyleSheet.create({
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  justifyStart: { justifyContent: 'flex-start' },
  container: {
    width: '100%',
    backgroundColor: colors.gray_dark,
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
    paddingTop: 25,
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingBottom: 45,
  },
  aspectItemsWrapper: {
    backgroundColor: colors.gray_dark_2,
    borderRadius: 16,
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
    width: WIDTH - 6.5 * PADDING_HORIZONTAL,
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: colors.pink,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 10,
  },
});
