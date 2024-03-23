# @vahesaroyan/react-native-image-editor

### React Native image editor ( Android / iOS )

#### What can this app do:

* Scaling
* Cropping
* Rotating
* Single and multi editing
* Remembers your actions
* Choose custom aspect ratio or standard
* Works very fast with beautiful animations
* Works on a tablet

#### The main feature of the application is that all changes do not affect the original, but only collect parameters by which, when editing is completed, it will be possible to crop on the server side.

## Installation

npm:
```sh
npm install @vahesaroyan/react-native-image-editor
```
yarn:
```sh
yarn add @vahesaroyan/react-native-image-editor
```

### Kotlin
#### Since version 2.0.0 RNGH has been rewritten with Kotlin. The default version of the Kotlin plugin used in this library is 1.5.20.
#### If you need to use a different Kotlin version, set the kotlinVersion ext property in `android/build.gradle` file and RNGH will use that version:
```sh
buildscript {
    ext {
        ...
          kotlinVersion = "1.6.21"
    }
}
```
### Babel plugin
#### Add Reanimated's and Svg's babel plugin to your `babel.config.js`:
```sh
 module.exports = {
    ...
      plugins: [
        ['react-native-reanimated/plugin'],
      ],
  };
```

#### If you're in a CocoaPods project, make sure to install pods before you run your app:
```sh
yarn
cd ios && pod install
react-native start --reset-cache
```

## Usage

```js
import { Editor } from "@vahesaroyan/react-native-image-editor";

const images = ['https://...', 'https://...', ...];

<Editor
  images={images}
  onPressCreate={ (e) => console.log(e) } // In the logs you will receive an object with settings for changed images and the settings of the editor itself .If the image has not been changed, the original data will be returned.
  onPressGoBack={ () => navigation.goBack() } // By clicking on the back button, you can return to the previous page or close the modal window
  initialSettingsForBackend={ null } // If you pass here an object with settings for the image and the editor, then you can start editing from the last edit
/>
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Props
| Property                                                | Type                                                                                                                                                                                                                                                                                                                                                                                       | Description                                                                                                                             |
|---------------------------------------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|:----------------------------------------------------------------------------------------------------------------------------------------|
| images                                                  | string [ ]                                                                                                                                                                                                                                                                                                                                                                                 | Initial images for editing.                                                                                                             |
| onPressCreate                                           | func ( e ) => { <br/>settings: { height: number; width: number; boxHeight: number; boxWidth: number; x: number; y: number; rotate: number}, <br/>editorSettings: { aspect: { id: number; name: string; value: { x: number; y: number } } or null; minScale: number; proportion: number; top: number; bottom: number; left: number; right: number; scale: number; rotate: number; x: number; y: number }<br/>} [ ]                             | When you click on the Create Cast button, the function returns an array with the edited coordinates for all images and editor settings. |
| initialSettingsForBackend                               | { <br/>settings: {  height: number; width: number; boxHeight: number; boxWidth: number; x: number; y: number; rotate: number}, <br/>editorSettings: { aspect: { id: number; name: string; value: { x: number; y: number } } or null; minScale: number; proportion: number; top: number; bottom: number; left: number; right: number; scale: number; rotate: number; x: number; y: number }<br/>} [ ]<br/> ( default null ) | If you need to edit the modified image.                                                                                                 |
| aspectItemsData                                         | { <br/>id: number; name: string;<br/> value: { x: number; y: number }<br/>} [ ]                                                                                                                                                                                                                                                                                                            | If you need to change default aspect ratios.                                                                                            |
|
| onPressGoBack                                           | func ( ) => void                                                                                                                                                                                                                                                                                                                                                                           | By clicking on the Back button, you can navigate go back.                                                                               |
| iconCrop, iconPalette, iconRotate, iconRedo, iconUndo, iconReset | ImageProps['source']                                                                                                                                                                                                                                                                                                                                                                       | To change icons.                                                                                                                        |
| aspectRatioBtnText, backgroundColorBtnText, createBtnText | string                                                                                                                                                                                                                                                                                                                                                                                     | To change buttons text.                                                                                                                 |
| editorTitle | string                                                                                                                                                                                                                                                                                                                                                                                     | To change editor title.                                                                                                                 |

## License

MIT
