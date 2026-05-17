import React from 'react';
import { StatusBar } from 'react-native';

// Import the App Navigator
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      <AppNavigator />
    </AuthProvider>
  );
};

export default App;
