// controllers/NavigationController.ts
import { Alert } from 'react-native';

export class NavigationController {
  static navigateToScreen(screen: 'Home' | 'About' | 'Settings' | 'Directory' | 'Emergency', navigation: any) {
    switch (screen) {
      case 'Home':
        navigation.navigate('Home');
        break;
      case 'About':
        navigation.navigate('About');
        break;
      case 'Directory':
        navigation.navigate('Directory');
        break;
      case 'Emergency':
        navigation.navigate('Emergency');
        break;
      case 'Settings':
        Alert.alert('Settings', 'Settings screen is not yet implemented.');
        break;
    }
  }
}
