/**
 * 알림 관련 API 모듈
 *
 * 웹과의 차이점:
 *   웹은 브라우저 내장 EventSource를 사용하지만, React Native는 EventSource가 없습니다.
 *   @microsoft/fetch-event-source 패키지로 SSE를 구현합니다.
 *
 * 웹과 비교한 또 다른 차이점:
 *   웹: 토큰을 URL 쿼리 파라미터로 전달 (?token=xxx)
 *       → EventSource는 커스텀 헤더를 지원하지 않아서
 *   앱: 토큰을 Authorization 헤더로 전달
 *       → fetchEventSource는 커스텀 헤더를 지원하므로 더 안전한 방식 사용 가능
 */

import { fetchEventSource } from '@microsoft/fetch-event-source';
import { axiosInstance } from './axiosInstance';
import { Notification } from '@/src/types';
import { BASE_URL } from '../constants';

// ─────────────────────────────────────────────
// SSE 실시간 알림 연결
// ─────────────────────────────────────────────

/**
 * SSE 알림 스트림 연결
 * GET /notifications/stream
 *
 * 서버와 SSE 연결을 맺고, 새 알림이 올 때마다 onNotification 콜백을 실행합니다.
 * 연결 오류 시 fetchEventSource가 자동으로 재연결을 시도합니다.
 *
 * 사용 예시 (app/_layout.tsx):
 *   const disconnect = connectNotificationStream(token, (notification) => {
 *     addNotification(notification);
 *   });
 *   // 로그아웃 또는 컴포넌트 언마운트 시:
 *   disconnect();
 *
 * @param token          Authorization 헤더에 넣을 액세스 토큰
 * @param onNotification 새 알림 수신 시 실행할 콜백 함수
 * @returns              SSE 연결을 끊는 함수 (로그아웃 또는 언마운트 시 호출)
 */
export const connectNotificationStream = (
  token: string,
  onNotification: (notification: Notification) => void
): (() => void) => {

  // AbortController: SSE 연결을 강제로 끊을 때 사용합니다.
  // controller.abort()를 호출하면 fetchEventSource가 연결을 종료합니다.
  const controller = new AbortController();

  // fetchEventSource는 Promise를 반환하지만
  // SSE는 계속 연결을 유지하는 특성상 await하지 않습니다.
  fetchEventSource(`${BASE_URL}/notifications/stream`, {
    method: 'GET',

    headers: {
      // 웹과 달리 헤더로 토큰을 전달합니다 (쿼리 파라미터보다 안전)
      Authorization: `Bearer ${token}`,
    },

    // AbortController의 signal을 전달해서 abort() 시 연결이 끊기도록 합니다
    signal: controller.signal,
    openWhenHidden: true,  // ← React Native에 document가 없으므로 필수

    /**
     * 서버에서 이벤트가 올 때 실행되는 핸들러
     * 서버는 아래 형식으로 데이터를 보냅니다:
     *   event: notification
     *   data: {"notificationId": 1, "message": "...", ...}
     */
    onmessage(event) {
      // event.event: 이벤트 타입 (서버에서 지정한 이름)
      // 웹 notificationApi.js의 addEventListener('notification', ...) 와 동일한 역할
      if (event.event === 'notification') {
        try {
          // JSON 문자열을 Notification 객체로 변환
          const notification: Notification = JSON.parse(event.data);
          // 콜백 실행 → authStore.addNotification()으로 연결됩니다
          onNotification(notification);
        } catch (e) {
          console.warn('[SSE] 알림 데이터 파싱 오류:', e);
        }
      }
    },

    /**
     * 연결 오류 시 실행되는 핸들러
     * fetchEventSource는 기본적으로 오류 발생 시 자동으로 재연결을 시도합니다.
     * throw를 하면 재연결을 중단합니다.
     */
    onerror(err) {
      console.warn('[SSE] 연결 오류, 자동 재연결 시도 중:', err);
      // throw하지 않으면 fetchEventSource가 자동으로 재연결합니다
    },

    /** 서버가 연결을 정상적으로 닫았을 때 */
    onclose() {
      console.log('[SSE] 서버에서 연결을 종료했습니다.');
    },
  });

  // 연결 해제 함수를 반환합니다
  // 로그아웃 또는 컴포넌트 언마운트 시 이 함수를 호출하세요
  return () => {
    console.log('[SSE] 연결 해제');
    controller.abort();
  };
};

// ─────────────────────────────────────────────
// 알림 목록 조회
// ─────────────────────────────────────────────

/**
 * 읽지 않은 알림 목록 조회
 * GET /notifications/unread
 *
 * 앱 시작 시 또는 포그라운드 복귀 시 호출해서
 * SSE가 끊겨 있는 동안 놓친 알림을 보완합니다.
 * @returns 읽지 않은 알림 목록 배열
 */
export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await axiosInstance.get<Notification[]>(
    '/notifications/unread'
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 알림 읽음 처리
// ─────────────────────────────────────────────

/**
 * 알림 읽음 처리
 * PATCH /notifications/{notificationId}/read
 * 알림 목록에서 알림을 탭했을 때 호출합니다.
 * @param notificationId 읽음 처리할 알림 ID
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<void> => {
  await axiosInstance.patch(`/notifications/${notificationId}/read`);
};
