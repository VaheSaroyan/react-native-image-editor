import { StyleSheet } from 'react-native';
import { IS_IPAD, WIDTH } from '../../../utils/constants';
import { colors } from '../../../assets/colors';

const PADDING_HORIZONTAL = !IS_IPAD ? 16 : 24;
const COLOR_SIZE = !IS_IPAD
  ? (WIDTH - 3 * PADDING_HORIZONTAL) / 12
  : (WIDTH * 0.69999995 - 3 * PADDING_HORIZONTAL) / 12;

export const s = StyleSheet.create({
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
  colorButton: {
    height: COLOR_SIZE,
    width: COLOR_SIZE,
    transform: [{ scale: 1.02 }],
  },
  paddingHorizontal: { paddingHorizontal: PADDING_HORIZONTAL / 2 }
});
