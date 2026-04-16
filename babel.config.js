/**
 * Babel 설정 파일
 *
 * Babel은 최신 JavaScript/TypeScript 문법을 React Native가 이해할 수 있는
 * 코드로 변환해주는 도구입니다.
 *
 * NativeWind v4부터는 Babel 플러그인 방식을 사용하지 않습니다.
 * className 처리는 metro.config.js의 withNativeWind()가 담당합니다.
 */
module.exports = function (api) {
  // cache(true): 변환 결과를 캐시해서 빌드 속도를 높입니다
  api.cache(true)

  return {
    presets: [
      // Expo 기본 프리셋 (TypeScript, JSX 변환 포함)
      'babel-preset-expo',
    ],
    // NativeWind v4는 metro.config.js에서 설정 — 여기에 플러그인 추가 불필요
  }
}