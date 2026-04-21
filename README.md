# Wildlife Safety Mobile App 🐍

This is a React Native mobile application designed to promote wildlife safety by helping users identify various snake species using their device's camera. The app features both online and offline classification capabilities to ensure functionality even in remote areas.

## ✨ Features

- **Real-time Image Classification**: Identify snakes from your camera or gallery.
- **Offline Mode**: Utilizes a built-in TensorFlow Lite model (`snake_model.tflite`) to identify 6 different snake species without an internet connection.
- **Offline Model Species**: The current offline model can identify the following species:
  - Common Indian Krait
  - Green Vine Snake
  - Hump-nosed pit viper
  - Indian Cobra
  - Python
  - Russell's Viper
- **Online Mode**: Leverages a remote server for a broader range of wildlife classification.

## 🛠️ Tech Stack

- **Framework**: React Native
- **Language**: TypeScript
- **On-Device ML**: TensorFlow Lite
- **Native Modules**: Custom Kotlin/Java native modules for ML model integration on Android.

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Install Dependencies

```sh
# Using npm
npm install

# OR using Yarn
yarn install
```

## Step 2: Run the App

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

> For iOS, you must install the CocoaPods dependencies first.
```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
