import Constants from 'expo-constants';

/**
 * 서버 기본 URL
 *
 * app.config.js의 extra.apiUrl 값을 읽습니다.
 * 이 값은 각자의 .env 파일에서 EXPO_PUBLIC_API_URL로 설정합니다.
 *
 * 설정 방법:
 *   1. 프로젝트 루트에 .env 파일 생성
 *   2. EXPO_PUBLIC_API_URL=http://본인IP:8080 입력
 *   3. ipconfig 명령어로 본인 IPv4 주소 확인
 */
export const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ?? 'http://10.0.2.2:8080';