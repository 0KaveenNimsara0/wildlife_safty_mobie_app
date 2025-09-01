import React from 'react';
import { StatusBar } from 'react-native';

// Import the App Navigator
import AppNavigator from './android/app/src/navigation/AppNavigator';

const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <AppNavigator />
    </>
  );
};

export default App;
