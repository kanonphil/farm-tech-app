/**
 * Metro 번들러 설정 파일
 *
 * Metro는 React Native의 기본 번들러입니다.
 * withNativeWind()로 감싸면 NativeWind v4의 className 처리가 활성화됩니다.
 *
 * @param {import('expo/metro-config').MetroConfig} config
 */
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** Expo 기본 Metro 설정을 기반으로 시작 */
const config = getDefaultConfig(__dirname)

/**
 * withNativeWind: NativeWind v4 className 변환을 Metro 레벨에서 처리합니다.
 * input: Tailwind 지시어가 있는 글로벌 CSS 파일 경로
 */
module.exports = withNativeWind(config, { input: './global.css' })