// controllers/ImageController.ts
import {launchImageLibrary, launchCamera, ImagePickerResponse, Asset} from 'react-native-image-picker';
import HapticFeedback from 'react-native-haptic-feedback';

export class ImageController {
  static pickImage(callback: (asset: Asset | null) => void) {
    launchImageLibrary({mediaType: 'photo'}, (response: ImagePickerResponse) => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.error(`ImagePicker Error: ${response.errorMessage}`);
        callback(null);
      } else if (response.assets && response.assets[0]) {
        HapticFeedback.trigger('impactLight', {enableVibrateFallback: true, ignoreAndroidSystemSettings: false});
        callback(response.assets[0]);
      }
    });
  }

  static captureImage(callback: (asset: Asset | null) => void) {
    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        quality: 0.8,
        saveToPhotos: true,
      },
      (response: ImagePickerResponse) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error(`Camera Error: ${response.errorMessage}`);
          callback(null);
        } else if (response.assets && response.assets[0]) {
          HapticFeedback.trigger('impactLight', {enableVibrateFallback: true, ignoreAndroidSystemSettings: false});
          callback(response.assets[0]);
        }
      },
    );
  }
}
