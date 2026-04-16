<!-- npx expo start --go
npx eas build -p android --profile debug
npx eas build -p android --profile debug --local

npx eas build -p android --profile production
npx eas build -p android --profile production-apk -->

npx expo prebuild --clean

npx expo start --dev-client
eas build -p android --profile development

cd android
.\gradlew assembleDebug
.\gradlew bundleRelease
