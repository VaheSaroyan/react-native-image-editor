# @vahesaroyan/react-native-image-editor

React Native image editor

## Installation

```sh
npm install @vahesaroyan/react-native-image-editor
```

#### Problems with Proguard
#### When Proguard is enabled (which it is by default for Android release builds), it causes runtime error. To avoid this, add an exception to `android/app/proguard-rules.pro`:

```sh
-keep public class com.horcrux.svg.** {*;}
```

### Kotlin
#### Since version 2.0.0 RNGH has been rewritten with Kotlin. The default version of the Kotlin plugin used in this library is 1.5.20.
#### If you need to use a different Kotlin version, set the kotlinVersion ext property in `android/build.gradle` file and RNGH will use that version:
```sh
buildscript {
    ext {
        ...
        kotlinVersion = "1.5.20"
    }
}
```
### Babel plugin
#### Add Reanimated's and Svg's babel plugin to your `babel.config.js`:
```sh
 module.exports = {
      ...
        plugins: [
    [
      'babel-plugin-inline-import',
      {
        extensions: ['.svg'],
      },
    ],
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

// ...

const result = await multiply(3, 7);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
