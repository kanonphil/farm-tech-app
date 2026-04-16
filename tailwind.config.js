/**
 * Tailwind CSS 설정 파일 (NativeWind v4)
 *
 * NativeWind v4부터는 presets에 'nativewind/preset'을 반드시 추가해야 합니다.
 * 이게 없으면 React Native 전용 유틸리티 클래스(flex, items-center 등)가 동작하지 않습니다.
 *
 * content: Tailwind가 className을 스캔할 파일 경로 목록
 *          여기에 없는 파일의 className은 빌드에서 제외됩니다.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind v4 필수 설정
  presets: [require('nativewind/preset')],

  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      // 한우마루 브랜드 컬러를 Tailwind 커스텀 색상으로 등록
      // 예: className="bg-primary" , className="text-primary"
      colors: {
        primary: '#e63946',
        'primary-dark': '#c00',
      },
    },
  },

  plugins: [],
};