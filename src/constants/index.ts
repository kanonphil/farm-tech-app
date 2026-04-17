
/**
 * 서버 기본 URL
 *
 * .env 파일의 EXPO_PUBLIC_API_URL 값을 사용합니다.
 *
 * 설정 방법:
 *   1. 프로젝트 루트에 .env 파일 생성
 *   2. 아래와 같이 API 서버 주소 입력
 *      EXPO_PUBLIC_API_URL=http://본인IP:포트
 *
 *   3. 본인 PC의 IPv4 주소 확인 (ipconfig / ifconfig)
 *   4. 모바일 기기와 PC가 같은 Wi-Fi에 연결되어 있어야 함
 *
 * 주의:
 *   - localhost, 127.0.0.1 사용 ❌ (모바일에서는 자기 자신을 가리킴)
 *   - 10.0.2.2는 Android 에뮬레이터 전용
 *   - 반드시 실제 PC의 로컬 IP 사용
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL

if (!apiUrl) {
  throw new Error('EXPO_PUBLIC_API_URL is not set')
}

export const BASE_URL = apiUrl