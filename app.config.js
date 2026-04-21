/**
 * app.config.js
 *
 * app.json을 JS 파일로 대체합니다.
 * JS 파일로 바꾸면 .env 값을 동적으로 읽을 수 있습니다.
 *
 * Expo는 EXPO_PUBLIC_ 접두사가 붙은 환경변수를 .env에서 자동으로 읽습니다.
 * 별도 패키지 설치 없이 process.env.변수명 으로 접근합니다.
 */
export default {
  expo: {
    name: '한우마루',
    slug: 'farm-tech',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'hanumarutrade',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/images/android-icon-foreground.png',
        backgroundImage: './assets/images/android-icon-background.png',
        monochromeImage: './assets/images/android-icon-monochrome.png',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
          dark: {
            backgroundColor: '#000000',
          },
        },
      ],
      'expo-secure-store',
      'expo-web-browser',
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    // extra: {
    //   /**
    //    * .env의 EXPO_PUBLIC_API_URL 값을 읽습니다.
    //    * .env 파일이 없거나 값이 없으면 안드로이드 에뮬레이터 기본값 사용
    //    */
    //   apiUrl: process.env.EXPO_PUBLIC_API_URL,
    // },
  },
};