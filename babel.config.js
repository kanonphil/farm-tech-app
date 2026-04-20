/**
 * Babel 설정 파일
 *
 * NativeWind v4 설정 방식:
 *  - metro.config.js (withNativeWind): global.css → Tailwind 스타일시트 생성
 *  - jsxImportSource: "nativewind": JSX 팩토리를 NativeWind 버전으로 교체
 *    → 별도 babel 플러그인 없이 className prop을 style로 변환
 *
 * 주의: 예전 docs에서 보이는 plugins: ["nativewind/babel"]은
 *       v4.2.x 에서 preset 형식으로 바뀌어 plugins 배열에 넣으면 에러 발생
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};