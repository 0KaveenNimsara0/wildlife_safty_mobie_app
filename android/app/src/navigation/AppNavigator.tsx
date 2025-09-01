import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../views/screens/HomeScreen';
import AboutScreen from '../views/screens/AboutScreen';
import SnakeDirectoryScreen from '../views/screens/SnakeDirectoryScreen';
import EmergencyScreen from '../views/screens/EmergencyScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Directory" component={SnakeDirectoryScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
