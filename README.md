# FitFuel India — Android starter project

A premium dark-theme React Native app starter for Indian diet and muscle-gain tracking.

## Features included
- Local demo profile / sign-in screen
- Dashboard with daily calories and protein progress
- Indian food list and food logging
- Sample meal plan
- Starter workout split with completion checkmarks
- Body-weight history
- Built-in rule-based "AI coach" demo
- User-selectable fitness goal, diet preference, calorie target, and protein target
- Local device persistence via AsyncStorage

## Important limitations
- Login is a **local demo profile**, not secure authentication.
- The AI coach is rule-based sample guidance, not a connected AI model.
- Food nutrition numbers are estimates and may vary by serving and preparation.
- This project is source code, not a prebuilt APK. Build an APK with EAS Build after setting up an Expo account.
- It is a fitness tracker, not medical advice.

## Run on Android (easy test)
1. Install Node.js LTS on a computer.
2. Extract this ZIP.
3. In a terminal, open the `fitfuel-india` folder.
4. Run `npm install`.
5. Run `npx expo start`.
6. Install **Expo Go** on your Android phone from Google Play.
7. Put your phone and computer on the same Wi-Fi. Scan the QR code shown by Expo Go / the terminal.
   - If local network discovery fails, run `npx expo start --tunnel` (may require installing Expo's tunnel dependency when prompted).

## Build an installable APK
The simplest route is Expo Application Services (EAS):
1. Create/sign in to an Expo account.
2. Install EAS CLI: `npm install -g eas-cli`
3. Run `eas login`
4. Run `eas build:configure`
5. Add an `eas.json` file with this profile:

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

6. Run `eas build -p android --profile preview`.
7. Download the APK from the build link EAS provides and install it on your Android phone.

## Project files
- `App.js` — app screens and interactions
- `app.json` — Expo app configuration
- `package.json` — dependencies and scripts
- `babel.config.js` — Babel configuration

## Next production steps
- Replace demo profile with Firebase/Supabase/Auth backend.
- Connect a real AI endpoint securely from a backend (never put private API keys in the app).
- Add profile deletion, data export, privacy policy, accessibility checks, tests, and nutrition data review.
