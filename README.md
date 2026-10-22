# BookGarden Mobile

Cross-platform iOS/Android app built with Expo Router and React Native.

## Run
1. Install Node.js LTS.
2. Run `npm install`.
3. Run `npx expo start`.
4. Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

## API
The app calls the deployed BookGarden API at `https://bookgarden-inspired-preview.vercel.app/api/books?q=...`.
Book discovery needs an internet connection. Shelf, reading status, progress, and goals persist locally on this device with AsyncStorage.

## Included screens
Discover, Search, Book details, My Shelf, Reading tracker, Reading goals, Settings, and onboarding/welcome.
This is an Expo app project, not yet submitted to the Apple App Store or Google Play.
