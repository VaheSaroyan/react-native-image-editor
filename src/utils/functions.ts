import type {
  EditorSettingsType,
  SettingsType,
} from '@vahesaroyan/react-native-image-editor';

export const initDefaultSettingsObject = (
  imagesSize: { [p: string]: { height: number; width: number } },
  index: number
): SettingsType => ({
  height: imagesSize[index]?.height ?? 0,
  width: imagesSize[index]?.width ?? 0,
  boxHeight: imagesSize[index]?.height ?? 0,
  boxWidth: imagesSize[index]?.width ?? 0,
  y: 0,
  x: 0,
  rotate: 0,
  border: '',
});

export const initSettingsObjects = (settings: SettingsType): SettingsType[] => [
  {
    height: settings.height,
    width: settings.width,
    boxHeight: settings.height,
    boxWidth: settings.width,
    y: 0,
    x: 0,
    rotate: 0,
    border: '',
  },
  {
    height: settings.height,
    width: settings.width,
    boxHeight: settings.boxHeight,
    boxWidth: settings.boxWidth,
    y: settings.y,
    x: settings.x,
    rotate: settings.rotate,
    border: settings.border,
  },
];

export const initDefaultEditorSettingsObject = (img: {
  height: number;
  width: number;
  proportion: number;
  vertical: number;
  horizontal: number;
}): EditorSettingsType => ({
  aspect: null,
  top: img.vertical,
  bottom: img.vertical,
  left: img.horizontal,
  right: img.horizontal,
  proportion: img.proportion,
  minScale: 1,
  scale: 1,
  rotate: 0,
  x: 0,
  y: 0,
  border: null,
  flip: {
    horizontal: false,
    vertical: false,
  },
});

export const initEditorSettingsObject = (
  editorSettings: EditorSettingsType
): EditorSettingsType => ({
  aspect: editorSettings.aspect,
  top: editorSettings.top,
  bottom: editorSettings.bottom,
  left: editorSettings.left,
  right: editorSettings.right,
  proportion: editorSettings.proportion,
  minScale: editorSettings.minScale,
  scale: editorSettings.scale,
  rotate: editorSettings.rotate,
  x: editorSettings.x,
  y: editorSettings.y,
  border: editorSettings.border,
  flip: editorSettings.flip,
});
