import React, { useEffect, useRef, useState } from 'react';
import {
  BtnGroup,
  type EditorRef,
  EditorView,
  Header,
  ImagesMiniatures,
  ModalComponent,
  SelectedBtnType,
} from '../../molecules';
import {
  Image,
  type ImageProps,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Icon, Loader } from '../../atoms';
import {
  ASPECT_DATA,
  EDITOR_HEIGHT,
  EDITOR_PADDINGS,
  EDITOR_WIDTH,
  IS_IPAD,
} from '../../../utils/constants';
import { icons } from '../../../assets/icons';
import FastImage, { type OnLoadEvent } from 'react-native-fast-image';
import { imgResizer } from '../../../utils/imgResizer';
import {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useMount } from '../../../hooks/useMount';
import {
  initDefaultEditorSettingsObject,
  initDefaultSettingsObject,
  initEditorSettingsObject,
  initSettingsObjects,
} from '../../../utils/functions';

export type SettingsType = {
  height: number;
  width: number;
  boxHeight: number;
  boxWidth: number;
  x: number;
  y: number;
  rotate: number;
  border: string;
};
export type EditorSettingsType = {
  aspect: aspectType | null;
  minScale: number;
  proportion: number;
  top: number;
  bottom: number;
  left: number;
  right: number;
  scale: number;
  rotate: number;
  x: number;
  y: number;
  border: { color: string; width: number } | null;
  flip: { horizontal: boolean; vertical: boolean };
};
type Props = {
  images: string[];
  initialSettingsForBackend:
    | {
        settings: SettingsType;
        editorSettings: EditorSettingsType;
      }[]
    | null;
  onPressGoBack?: () => void;
  onPressCreate: (
    coordinates: {
      settings: imagesConfigsType['settings'];
      editorSettings: imagesConfigsType['editor'];
    }[]
  ) => void;
  iconCrop?: ImageProps['source'];
  iconPalette?: ImageProps['source'];
  iconRotate?: ImageProps['source'];
  iconRedo?: ImageProps['source'];
  iconUndo?: ImageProps['source'];
  iconReset?: ImageProps['source'];
  iconFlipHorizontal?: ImageProps['source'];
  iconFlipVertical?: ImageProps['source'];
  aspectItemsData?: aspectType[];
  aspectRatioBtnText?: string;
  backgroundColorBtnText?: string;
  createBtnText?: string;
  editorTitle?: string;
};
export type aspectType = {
  id: number;
  name: string;
  value: { x: number; y: number };
};

type imagesConfigsType = {
  img: string;
  count: number;
  settings: SettingsType[];
  editor: EditorSettingsType[];
};
export const Editor = ({
  images,
  onPressGoBack,
  onPressCreate,
  iconCrop,
  iconPalette,
  iconRotate,
  iconRedo,
  iconUndo,
  iconReset,
  iconFlipHorizontal,
  iconFlipVertical,
  aspectItemsData,
  aspectRatioBtnText,
  backgroundColorBtnText,
  createBtnText,
  editorTitle,
  initialSettingsForBackend,
}: Props) => {
  const [imagesSize, setImagesSize] = useState<{
    [keys: string]: { height: number; width: number };
  }>({});
  const [initialState, setInitialState] = useState<{
    [keys: string]: imagesConfigsType;
  }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedAspect, setSelectedAspect] = useState<aspectType | null>(null);
  const [selectedBtn, setSelectedBtn] = useState(SelectedBtnType.NONE);
  const editorRef = useRef<EditorRef>(null);
  const [loading, setLoading] = useState(true);
  const width = useSharedValue(0);
  const opacity = useSharedValue(1);
  const aspectData: aspectType[] = aspectItemsData
    ? aspectItemsData
    : ASPECT_DATA;

  const widthStyle = useAnimatedStyle(() => {
    return { width: `${width.value}%` };
  });
  const opacityStyle = useAnimatedStyle(() => {
    return { opacity: opacity.value };
  });
  // console.log(initialState[0]);
  // console.log(initialState[0]?.settings[initialState[0]?.settings.length - 1]);
  // console.log(initialState[0]?.editor[initialState[0]?.editor.length - 1]);
  // console.log({initialState});
  const onPressCreateHandler = () => {
    let imagesPositionsArr: any[];
    imagesPositionsArr = Object.keys(initialState).map((item) => {
      return {
        settings:
          initialState?.[item]?.settings[initialState?.[item]?.count ?? 0],
        editorSettings:
          initialState?.[item]?.editor[initialState?.[item]?.count ?? 0],
      };
    });
    onPressCreate(imagesPositionsArr);
  };

  useMount(() => {
    if (Platform.OS === 'android' && initialSettingsForBackend === null) {
      images.forEach((img, index) => {
        Image.getSize(img, (width, height) => {
          setImagesSize((prev: any) => {
            return { ...prev, [index]: { height, width } };
          });
        });
      });
    }
  });

  useEffect(() => {
    const init: { [keys: string]: imagesConfigsType } = {};
    if (
      Object.keys(imagesSize).length === images.length ||
      initialSettingsForBackend !== null
    ) {
      images.map((item, index) => {
        let img;
        if (initialSettingsForBackend === null) {
          img = imgResizer(
            imagesSize[index]?.height ?? 0,
            imagesSize[index]?.width ?? 0
          );
        } else {
          const settings = initialSettingsForBackend[index]?.settings ?? {
            height: 0,
            width: 0,
          };
          img = imgResizer(settings.height, settings.width);
        }
        if (initialSettingsForBackend === null) {
          init[index] = {
            img: item,
            count: 0,
            settings: [initDefaultSettingsObject(imagesSize, index)],
            editor: [initDefaultEditorSettingsObject(img)],
          };
        } else {
          const settings = initialSettingsForBackend[index]?.settings;
          const editorSettings =
            initialSettingsForBackend[index]?.editorSettings;
          if (editorSettings && settings) {
            init[index] = {
              img: item,
              count: 1,
              settings: initSettingsObjects(settings),
              editor: [
                initDefaultEditorSettingsObject(img),
                initEditorSettingsObject(editorSettings),
              ],
            };
          }
        }
        return init;
      });
    }
    setInitialState(init);
  }, [imagesSize]);

  useEffect(() => {
    if (
      Object.keys(initialState)?.length === images.length ||
      initialSettingsForBackend
    ) {
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [Object.keys(initialState).length]);

  useEffect(() => {
    width.value = withTiming(
      (Object.keys(imagesSize).length * 100) / images.length
    );
  }, [Object.keys(imagesSize).length]);

  return (
    <SafeAreaView style={[s.flex1, { backgroundColor: colors.black }]}>
      {!loading ? (
        <>
          <View style={s.container}>
            <Header
              styleContainer={s.header}
              {...{ editorTitle, onPressGoBack }}
            />
            <View style={s.divider} />
            {images.length > 1 && IS_IPAD ? (
              <ImagesMiniatures
                data={images}
                styleContainer={s.marginBottom7}
                {...{ selectedIndex, setSelectedAspect, setSelectedIndex }}
              />
            ) : null}
            <BtnGroup
              counter={initialState?.[selectedIndex]?.count ?? 0}
              imageSettings={initialState?.[selectedIndex]?.settings ?? []}
              editorSettings={initialState?.[selectedIndex]?.editor ?? []}
              {...{
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
              }}
              onPressCrop={() => {
                editorRef.current?.crop();
              }}
              onPressReset={() => {
                editorRef.current?.reset();
              }}
              onPressRotate={() => {
                editorRef.current?.rotate();
              }}
              onPressRedo={() => {
                editorRef.current?.redo();
              }}
              onPressUndo={() => {
                editorRef.current?.undo();
              }}
              onPressFlip={(flip: any, type: any) => {
                editorRef.current?.flip(flip, type);
              }}
            />

            <EditorView
              ref={editorRef}
              counter={initialState?.[selectedIndex]?.count ?? 0}
              imageSettings={initialState?.[selectedIndex]?.settings ?? []}
              editorSettings={initialState?.[selectedIndex]?.editor ?? []}
              image={initialState?.[selectedIndex]?.img ?? ''}
              styleContainer={[
                images.length === 1
                  ? s.editorViewBigMargins
                  : s.editorViewSmallMargins,
                IS_IPAD ? { width: EDITOR_WIDTH, alignSelf: 'center' } : {},
                images.length === 1 && IS_IPAD
                  ? { height: EDITOR_HEIGHT + 55 }
                  : { height: EDITOR_HEIGHT },
              ]}
              {...{
                selectedBtn,
                selectedAspect,
                setSelectedAspect,
                selectedIndex,
                setInitialState,
              }}
            />

            {images.length > 1 && !IS_IPAD ? (
              <ImagesMiniatures
                data={images}
                styleContainer={s.marginBottom7}
                {...{ selectedIndex, setSelectedAspect, setSelectedIndex }}
              />
            ) : null}
            <TouchableOpacity
              onPress={() => {
                setModalOpen(!modalOpen);
              }}
              disabled={selectedBtn === SelectedBtnType.NONE}
              style={[
                s.selectBtn,
                images.length === 1 || IS_IPAD
                  ? s.marginBottom30
                  : s.marginBottom10,
                {
                  backgroundColor:
                    selectedBtn === SelectedBtnType.NONE
                      ? colors.gray_dark
                      : colors.gray,
                },
                IS_IPAD ? s.selectBtnIpad : {},
              ]}
            >
              <Icon
                color={
                  selectedBtn === SelectedBtnType.NONE
                    ? colors.white_02
                    : colors.white
                }
                styleContainer={s.marginRight8}
                size={22}
                img={
                  selectedBtn === SelectedBtnType.PALETTE
                    ? icons.palette
                    : icons.aspect
                }
              />
              <AppText
                numberOfLines={1}
                style={[
                  s.textCenter,
                  s.maxWidthText,
                  {
                    color:
                      selectedBtn === SelectedBtnType.NONE
                        ? colors.white_02
                        : colors.white,
                  },
                ]}
              >
                {selectedBtn === SelectedBtnType.PALETTE
                  ? backgroundColorBtnText || 'Select Frame Color'
                  : aspectRatioBtnText || 'Select Aspect Ratio'}
              </AppText>
              <Icon
                color={colors.white_035}
                styleContainer={s.arrowIcon}
                size={10}
                img={icons.arrow}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onPressCreateHandler();
              }}
              style={s.createBtn}
            >
              <AppText
                numberOfLines={1}
                style={[s.textCenter, { color: colors.white }]}
              >
                {createBtnText || 'Create Cast'}
              </AppText>
            </TouchableOpacity>
          </View>
          <ModalComponent
            data={aspectData}
            type={selectedBtn}
            onPressAspect={(aspect: aspectType | null): void => {
              editorRef.current?.aspect(aspect);
            }}
            onPressPalette={(
              palette: { color: string; width: number } | null
            ) => {
              editorRef.current?.palette(palette);
            }}
            paletteValue={
              initialState[selectedIndex]?.editor?.[
                (initialState[selectedIndex]?.editor?.length ?? 0) - 1
              ]?.border ?? null
            }
            {...{
              modalOpen,
              setModalOpen,
              selectedAspect,
              setSelectedAspect,
              aspectRatioBtnText,
              backgroundColorBtnText,
            }}
          />
        </>
      ) : (
        <>
          <Loader {...{ opacityStyle, widthStyle }} />
          {Platform.OS === 'ios' && initialSettingsForBackend === null
            ? images.map((img, index) => (
                <FastImage
                  key={index}
                  style={s.nullableSize}
                  source={{
                    uri: img,
                    priority: FastImage.priority.normal,
                  }}
                  onLoad={(e: OnLoadEvent) => {
                    const imageHeight = e.nativeEvent.height;
                    const imageWidth = e.nativeEvent.width;
                    if (imageHeight && imageWidth) {
                      setImagesSize((prev: any) => {
                        return {
                          ...prev,
                          [index]: { height: imageHeight, width: imageWidth },
                        };
                      });
                    }
                  }}
                />
              ))
            : null}
        </>
      )}
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  flex1: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: EDITOR_PADDINGS,
  },
  header: {
    marginBottom: 10,
  },
  editorViewBigMargins: {
    marginTop: 15,
    marginBottom: 30,
  },
  editorViewSmallMargins: {
    marginTop: 12,
    marginBottom: 7,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.gray,
    marginBottom: 15,
  },
  selectBtn: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.gray,
    height: 45,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 15,
    paddingRight: 35,
    borderRadius: 10,
    maxWidth: '100%',
  },
  selectBtnIpad: {
    minWidth: 360,
    marginTop: 25,
  },
  createBtn: {
    alignSelf: 'center',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: EDITOR_PADDINGS,
    backgroundColor: colors.pink,
  },
  arrowIcon: {
    position: 'absolute',
    right: 15,
    transform: [{ rotate: '-90deg' }],
  },
  marginRight8: {
    marginRight: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  maxWidthText: {
    maxWidth: '85%',
  },
  marginBottom30: {
    marginBottom: 30,
  },
  marginBottom10: {
    marginBottom: 10,
  },
  marginBottom7: {
    marginBottom: 7,
  },
  nullableSize: {
    height: 0,
    width: 0,
  },
});
