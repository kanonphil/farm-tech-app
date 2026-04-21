import { TossSuccessParams } from '@/src/types'
import React from 'react'
import { View, Text, Linking, ActivityIndicator } from 'react-native'
import WebView, { WebViewMessageEvent, WebViewNavigation } from 'react-native-webview'

// ─────────────────────────────────────────────
// 결제 결과 인터셉트용 플레이스홀더 URL
// 실제로 이 URL에 접속하지 않고 WebView가 이동 직전에 인터셉트합니다
// ─────────────────────────────────────────────
const SUCCESS_URL = 'https://hanumaru.co.kr/payment/success'
const FAIL_URL = 'https://hanumaru.co.kr/payment/fail'

// 환경변수에서 Toss 클라이언트 키 주입
const CLIENT_KEY = process.env.EXPO_PUBLIC_TOSS_CLIENT_KEY ?? ''

/**
 * URL 쿼리 파라미터를 Record<string, string>으로 파싱
 * 예) '?paymentKey=abc&amount=168000' → { paymentKey: 'abc', amount: '168000' }
 */
function parseUrlParams(url: string): Record<string, string> {
  const result: Record<string, string> = {}
  const query = url.split('?')[1]
  if (!query) return result
  query.split('&').forEach((pair) => {
    const [key, value] = pair.split('=')
    if (key) result[decodeURIComponent(key)] = decodeURIComponent(value ?? '')
  })
  return result
}

/**
 * Toss 결제 위젯을 WebView에 렌더링하는 컴포넌트
 *
 * 결제 흐름:
 *  1. WebView가 Toss Payment Widget 스크립트를 CDN에서 로드
 *  2. 위젯이 결제 수단 목록과 약관 동의 UI를 렌더링
 *  3. "결제하기" 버튼 클릭 → paymentWidget.requestPayment() 호출
 *  4. Toss가 결제 처리 후 successUrl 또는 failUrl로 리다이렉트
 *  5. onShouldStartLoadWithRequest가 이를 감지 → 화면 이동 없이 콜백 호출
 *
 * 외부 결제 앱 처리 (카카오페이, 네이버페이 등):
 *  - Toss 위젯이 외부 앱 실행을 위해 커스텀 스킴(kakaotalk://, naverpay:// 등)으로 이동 시도
 *  - http/https가 아닌 URL은 Linking.openURL()로 외부 앱 실행
 *
 * @param tossOrderId  POST /orders에서 받은 주문 ID
 * @param amount       결제 금액
 * @param orderName    주문명 (예: "한우마루 주문 2건")
 * @param onSuccess    결제 성공 시 호출 — paymentKey, orderId, amount 전달
 * @param onFail       결제 실패/취소 시 호출 — 오류 메시지 전달
 */

interface TossPaymentWebViewProps {
  tossOrderId: string
  amount: number
  orderName: string
  onSuccess: (params: TossSuccessParams) => void
  onFail: (message: string) => void
}

export default function TossPaymentWebView({
  tossOrderId,
  amount,
  orderName,
  onSuccess,
  onFail,
}: TossPaymentWebViewProps) {
  // ─────────────────────────────────────────────
  // WebView에 주입할 HTML
  // 변수는 템플릿 리터럴로 직접 삽입합니다.
  // <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"></meta>
  // ─────────────────────────────────────────────
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, sans-serif; padding: 24px; background: #f9f9f9; }
      .title { font-size: 15px; font-weight: bold; color: #555; margin-bottom: 16px; }
      .amount { font-size: 22px; font-weight: bold; color: #1a1a1a; margin-bottom: 24px; }
      .method-btn {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 18px 16px;
        background: white;
        border: 1px solid #eee;
        border-radius: 12px;
        margin-bottom: 10px;
        font-size: 15px;
        font-weight: 500;
        color: #1a1a1a;
        cursor: pointer;
        text-align: left;
      }
      .method-btn:active { background: #f5f5f5; }
      .icon { margin-right: 12px; font-size: 22px; }
    </style>
  </head>
  <body>
    <p class="title">결제 수단 선택</p>
    <p class="amount">${amount.toLocaleString()}원</p>

    <button class="method-btn" onclick="pay('카드')">
      <span class="icon">💳</span> 카드 결제
    </button>
    <button class="method-btn" onclick="pay('토스페이')">
      <span class="icon">🔵</span> 토스페이
    </button>
    <button class="method-btn" onclick="pay('계좌이체')">
      <span class="icon">🏦</span> 계좌이체
    </button>

    <script src="https://js.tosspayments.com/v1"></script>
    <script>
      var tossPayments = TossPayments('${CLIENT_KEY}');

      function pay(method) {
        tossPayments.requestPayment(method, {
          amount: ${amount},
          orderId: '${tossOrderId}',
          orderName: '${orderName}',
          customerName: '고객',
          successUrl: '${SUCCESS_URL}',
          failUrl: '${FAIL_URL}',
        }).catch(function(error) {
          // 사용자가 직접 취소한 경우 오류 처리 불필요
          if (error.code === 'USER_CANCEL') return;

          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ERROR',
              message: error.message || '결제 중 오류가 발생했습니다.',
            }));
          }
        });
      }
    </script>
  </body>
  </html>
  `

  // ─────────────────────────────────────────────
  // URL 인터셉트 핸들러
  // ─────────────────────────────────────────────

  /**
   * WebView가 URL로 이동하기 전에 호출됩니다.
   * false를 반환하면 실제 이동을 막고 앱에서 직접 처리합니다.
   */
  const handleNavigation = (request: WebViewNavigation): boolean => {
    const { url } = request

    // ── 결제 성공 ──────────────────────────────
    if (url.startsWith(SUCCESS_URL)) {
      const params = parseUrlParams(url)
      onSuccess({
        paymentKey: params.paymentKey ?? '',
        orderId: params.orderId ?? '',
        amount: params.amount ?? '0',
      })
      return false
    }

    // ── 결제 실패 / 취소 ───────────────────────
    if (url.startsWith(FAIL_URL)) {
      const params = parseUrlParams(url)
      onFail(params.message ?? '결제에 실패했습니다.')
      return false
    }

    // ── http/https → WebView에서 정상 처리 ─────
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true
    }

    // ── Android intent:// URL 처리 ─────────────
    /**
     * Toss가 결제 앱을 열 때 Android에서 intent:// 형식의 URL을 사용합니다.
     * 예) intent://pay#Intent;scheme=kakaobank;package=com.kakaobank.channel;end
     *
     * Linking.openURL()은 intent:// URL을 직접 처리 못하기 때문에
     * URL에서 scheme을 추출해 직접 앱 스킴으로 열거나
     * 앱이 없을 때는 Play Store로 폴백합니다.
     */
    if (url.startsWith('intent://')) {
      const schemeMatch = url.match(/scheme=([^;]+)/)
      const packageMatch = url.match(/package=([^;]+)/)

      if (schemeMatch) {
        // intent://pay#Intent;scheme=kakaobank;... → kakaobank://pay
        const schemeUrl = url
          .replace('intent://', `${schemeMatch[1]}://`)
          .split('#')[0]

        Linking.openURL(schemeUrl).catch(() => {
          // 앱이 없으면 Play Store로 폴백
          if (packageMatch) {
            Linking.openURL(
              `market://details?id=${packageMatch[1]}`
            ).catch(() => {})
          }
        })
      } else if (packageMatch) {
        Linking.openURL(
          `market://details?id=${packageMatch[1]}`
        ).catch(() => {})
      }

      return false
    }

    // ── 기타 커스텀 스킴 (kakaotalk://, naverpay:// 등) ─
    Linking.openURL(url).catch(() => {
      /**
       * 에러를 무시합니다.
       * Linking이 실패해도 실제로는 앱이 열리는 경우가 있고,
       * 앱이 없다면 Toss 결제 페이지 자체에서 에러를 안내합니다.
       */
    })
    return false // 그 외 URL은 WebView에서 정상 처리
  }
  
  /**
   * WebView JS → RN 메시지 수신
   * 결제 오류 발생 시 Toss 위젯이 catch하고 postMessage로 전달합니다.
   */
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'ERROR') {
        onFail(data.message)
      }
    } catch {
      // 파싱 실패는 무시
    }
  }

  // ─────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────

  return (
    <WebView
      source={{ html, baseUrl: 'https://js.tosspayments.com' }}
      onShouldStartLoadWithRequest={handleNavigation}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      // 위젯 로드 중 스피너 표시
      startInLoadingState
      renderLoading={() => (
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <ActivityIndicator size="large" color="#e63946" />
          <Text style={{ marginTop: 12, color: '#888', fontSize: 14 }}>
            결제 수단을 불러오는 중...
          </Text>
        </View>
      )}
      style={{ flex: 1, backgroundColor: '#f9f9f9' }}
    />
  )
}