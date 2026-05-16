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
import PostDetailScreen from '../views/screens/PostDetailScreen';
import ArticlesScreen from '../views/screens/ArticlesScreen';
import NotificationsScreen from '../views/screens/NotificationsScreen';
import DiscoveriesScreen from '../views/screens/DiscoveriesScreen';
import DiscoveryDetailScreen from '../views/screens/DiscoveryDetailScreen';
import ArticleDetailScreen from '../views/screens/ArticleDetailScreen';
import MyArticlesScreen from '../views/screens/MyArticlesScreen';
import CreateArticleScreen from '../views/screens/CreateArticleScreen';
import HistoryScreen from '../views/screens/HistoryScreen';
import MyPostsScreen from '../views/screens/MyPostsScreen';

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
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="Articles" component={ArticlesScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Discoveries" component={DiscoveriesScreen} />
        <Stack.Screen name="DiscoveryDetail" component={DiscoveryDetailScreen} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
        <Stack.Screen name="MyArticles" component={MyArticlesScreen} />
        <Stack.Screen name="CreateArticle" component={CreateArticleScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="MyPosts" component={MyPostsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
