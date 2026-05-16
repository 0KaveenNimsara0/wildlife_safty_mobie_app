import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../views/screens/HomeScreen';
import AboutScreen from '../views/screens/AboutScreen';
import SnakeDirectoryScreen from '../views/screens/SnakeDirectoryScreen';
import EmergencyScreen from '../views/screens/EmergencyScreen';
import AuthScreen from '../views/screens/AuthScreen';
import ProfileScreen from '../views/screens/ProfileScreen';
import CommunityScreen from '../views/screens/CommunityScreen';
import CreatePostScreen from '../views/screens/CreatePostScreen';
import ChatListScreen from '../views/screens/ChatListScreen';
import ChatDetailScreen from '../views/screens/ChatDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Directory" component={SnakeDirectoryScreen} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
