import * as React from 'react';

import { StyleSheet } from 'react-native';
import { Editor } from '@vahesaroyan/react-native-image-editor';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={s.flex1}>
      <Editor
        image={
          'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80'
        }
        onPressCreate={(img) => console.log(img)}
      />
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  flex1: { flex: 1 },
});
