# FitFuel India — Android App Project

This folder contains the Expo / React Native source project for FitFuel India.

## Included features
- Local demo profile
- Calories and protein dashboard
- Indian food list and daily food log
- Sample meal plan
- Starter workout routine
- Weight history
- Rule-based demo AI coach
- Editable fitness goal, diet preference, calorie and protein targets

## Important limitations
- This is the app source project, not a prebuilt APK.
- Profile/login is stored locally on the device; it is not secure online authentication.
- The AI coach uses built-in sample responses; it is not connected to a live AI model.
- Nutrition numbers are estimates and not medical advice.

## Build an APK using an Android phone
A cloud build can compile this project, but it needs an Expo account and a way to run the Expo build command.

1. Extract `FitFuelIndia.zip` on your phone.
2. Create/sign in to an Expo account at https://expo.dev/
3. Upload this project to a GitHub repository (or use a browser-based development environment that can run Node.js).
4. In a terminal opened in the project folder, run:
   - `npm install`
   - `npx eas-cli login`
   - `npx eas-cli build -p android --profile preview`
5. Follow the prompts. When the cloud build finishes, open the build link on your phone and download the APK.
6. Tap the downloaded APK to install it. Android may ask you to allow installs from that browser/file manager.

`eas.json` is configured so the `preview` profile builds an APK.

## Run in Expo Go for a quick test
In a Node.js terminal inside the project folder:
1. `npm install`
2. `npx expo start --tunnel`
3. Open Expo Go on your Android phone and scan/open the project as prompted.

## Project files
- `App.js` — app screens and logic
- `app.json` — Expo app configuration
- `package.json` — dependencies and scripts
- `babel.config.js` — Babel configuration
- `eas.json` — APK build profile
