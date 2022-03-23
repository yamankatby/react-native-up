# react-native-up

Update 🤖 Android and 🍎 iOS apps versions from the command line.

## Why? 🤔

Opening the `Android Studio` and `Xcode` apps every time you want to update the app version is a pain. This is why I
created this tool.

`react-native-up` is a simple command line tool that updates the app versions in both `iOS` and `Android` projects.

## 🚀 Usage

```bash
npx react-native-up
```

> This tool using regular expressions to update `build.gradle` and `project.pbxproj` files. This tool may not work if you have made significant changes to these file structures.

## 🔧️ Options

| Option            | Description                                     |
|-------------------|-------------------------------------------------|
| `-a`, `--android` | Update 🤖 Android app version                   |
| `-i`, `--ios`     | Update 🍎 iOS app version                       |
| `-b`, `--both`    | Update both 🤖 Android and 🍎 iOS apps versions |
