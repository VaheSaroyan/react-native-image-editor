import React, { useRef, useState, FC } from 'react';
import {
  BtnGroup,
  EditorRef,
  EditorView,
  Header,
  ModalComponent,
  SelectedBtnType,
} from '../../molecules';
import {
  ImageProps,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../../assets/colors';
import { AppText, Icon } from '../../atoms';
import { EDITOR_PADDINGS, EDITOR_WIDTH } from '../../../utils/constants';
import { icons } from '../../../assets/icons';

type Props = {
  image: string;
  onPressGoBack?: () => void;
  onPressCreate?: (image: string) => void;
  iconCrop?: ImageProps['source'];
  iconPalette?: ImageProps['source'];
  iconRotate?: ImageProps['source'];
  iconRedo?: ImageProps['source'];
  iconUndo?: ImageProps['source'];
  iconReset?: ImageProps['source'];
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

export const Editor: FC<Props> = ({
  image,
  onPressGoBack,
  onPressCreate,
  iconCrop,
  iconPalette,
  iconRotate,
  iconRedo,
  iconUndo,
  iconReset,
  aspectItemsData,
  aspectRatioBtnText,
  backgroundColorBtnText,
  createBtnText,
  editorTitle,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAspect, setSelectedAspect] = useState<aspectType | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedBtn, setSelectedBtn] = useState(SelectedBtnType.NONE);
  const [counter, setCounter] = useState(0);
  const [cropImages, setCropImages] = useState<string[]>([]);
  const editorRef = useRef<EditorRef>(null);
  const aspectData: aspectType[] = aspectItemsData
    ? aspectItemsData
    : [
        { id: 1, name: 'Phone (Landscape)', value: { x: 2, y: 1 } },
        { id: 2, name: 'Phone (Portrait)', value: { x: 1, y: 2 } },
        { id: 3, name: 'Tablet (Landscape)', value: { x: 16, y: 9 } },
        { id: 4, name: 'Tablet (Portrait)', value: { x: 9, y: 16 } },
        { id: 5, name: 'TV (Landscape)', value: { x: 4, y: 3 } },
        { id: 6, name: 'TV (Portrait)', value: { x: 3, y: 4 } },
      ];
  return (
    <SafeAreaView style={[s.flex1, { backgroundColor: colors.black }]}>
      <View style={s.container}>
        <Header styleContainer={s.header} {...{ editorTitle, onPressGoBack }} />
        <View style={s.divider} />
        <BtnGroup
          {...{
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
        />
        <EditorView
          ref={editorRef}
          img={image}
          selectedAspect={selectedAspect?.value}
          styleContainer={s.marginVertical20}
          {...{
            counter,
            cropImages,
            selectedBtn,
            selectedColor,
            setCounter,
            setCropImages,
            setSelectedAspect,
            setSelectedColor,
          }}
        />

        <TouchableOpacity
          onPress={() => {
            setModalOpen(!modalOpen);
          }}
          disabled={selectedBtn === SelectedBtnType.NONE}
          style={[
            s.selectBtn,
            {
              backgroundColor:
                selectedBtn === SelectedBtnType.NONE
                  ? colors.gray_dark
                  : colors.gray,
            },
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
              ? backgroundColorBtnText || 'Select Background Color'
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
            onPressCreate && onPressCreate(cropImages[counter]);
          }}
          disabled={counter === 0}
          style={[
            s.createBtn,
            { backgroundColor: counter === 0 ? colors.gray_dark : colors.gray },
          ]}
        >
          <AppText
            numberOfLines={1}
            style={[
              s.textCenter,
              { color: counter === 0 ? colors.white_02 : colors.white },
            ]}
          >
            {createBtnText || 'Create Cast'}
          </AppText>
        </TouchableOpacity>
      </View>
      <ModalComponent
        data={aspectData}
        type={selectedBtn}
        {...{
          modalOpen,
          setModalOpen,
          selectedAspect,
          setSelectedAspect,
          selectedColor,
          setSelectedColor,
          aspectRatioBtnText,
          backgroundColorBtnText,
        }}
      />
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
  marginVertical20: {
    marginVertical: 15,
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
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 19,
    borderRadius: 10,
    marginBottom: 30,
    maxWidth: '100%',
  },
  createBtn: {
    alignSelf: 'center',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    width: EDITOR_WIDTH - 2 * EDITOR_PADDINGS,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: EDITOR_PADDINGS,
  },
  arrowIcon: {
    marginLeft: 30,
    transform: [{ rotate: '-90deg' }],
  },
  marginRight8: {
    marginRight: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  maxWidthText: {
    maxWidth: '80%',
  },
});
