/**
 * React Native 환경에서 브라우저 전용 API 폴리필
 *
 * @microsoft/fetch-event-source는 openWhenHidden: true 설정을 해도
 * AbortController.abort() 호출 시 내부적으로 document를 참조합니다.
 * React Native에는 document가 없으므로 최소한의 구현을 제공합니다.
 */
if (typeof document === 'undefined') {
  (global as any).document = {
    visibilityState: 'visible',
    hidden: false,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}
