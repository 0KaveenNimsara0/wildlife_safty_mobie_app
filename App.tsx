import React from 'react';
import { StatusBar } from 'react-native';

// Import the App Navigator
import AppNavigator from './android/app/src/navigation/AppNavigator';
import { AuthProvider } from './android/app/src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
