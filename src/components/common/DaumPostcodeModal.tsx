import { Colors } from '@/src/constants/colors'
import { DaumAddressData } from '@/src/types'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, Modal, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

/**
 * 다음 우편번호 서비스 WebView 모달
 *
 * 동작 방식:
 *  1. Modal 안에 WebView를 띄웁니다.
 *  2. WebView가 Daum Postcode 스크립트를 로드하고 바로 검색창을 엽니다.
 *  3. 사용자가 주소를 선택하면:
 *       JS → window.ReactNativeWebView.postMessage(JSON)
 *       RN → onMessage 핸들러가 받아서 onSelect 콜백으로 전달
 *  4. 모달이 닫히고 주소 필드가 자동 완성됩니다.
 *
 * @param visible    모달 표시 여부
 * @param onSelect   주소 선택 시 호출 — DaumAddressData 전달
 * @param onClose    모달 닫기 요청 시 호출 (X 버튼 / 뒤로가기)
 */

interface DaumPostcodeModalProps {
  visible: boolean
  onSelect: (data: DaumAddressData) => void
  onClose: () => void
}

/**
 * WebView에 주입할 HTML
 *
 * - Daum Postcode 스크립트를 CDN에서 로드
 * - 페이지가 로드되자마자 우편번호 검색창을 자동으로 열고 (open())
 * - 선택 완료 시 postMessage로 JSON 전달
 */
const DAUM_POSTCODE_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; }
    #postcode-wrap { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="postcode-wrap"></div>
  <script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
  <script>
    function sendToRN(data) {
      var json = JSON.stringify(data);
      // ReactNativeWebView 브릿지가 준비된 경우 사용
      // 준비 안 된 경우 window.postMessage로 fallback
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(json);
      } else {
        window.postMessage(json, '*');
      }
    }

    new daum.Postcode({
      oncomplete: function(data) {
        sendToRN(data);
      },
      width: '100%',
      height: '100%',
    }).embed(document.getElementById('postcode-wrap'));
  </script>
</body>
</html>
`

export default function DaumPostcodeModal({
  visible,
  onSelect,
  onClose,
}: DaumPostcodeModalProps) {
  /**
   * WebView → RN 메시지 수신 핸들러
   * Daum API가 보내는 JSON을 파싱해서 onSelect로 올려줍니다.
   */
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data: DaumAddressData = JSON.parse(event.nativeEvent.data)
      onSelect(data)
    } catch (error) {
      // JSON 파싱 실패 시 그냥 닫기
      onClose()
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose} // 안드로이드 뒤로가기 버튼
    >
      {/**
       * SafeAreaView: Modal 안에서도 노치/홈 인디케이터 침범 방지
       * Modal은 ScreenWrapper 밖에서 렌더링되므로 별도로 처리해야 합니다.
       */}
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>

        {/* ── 헤더 ───────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
          }}
        >
          <Text style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' }}>
            주소 검색
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── 다음 우편번호 WebView ────────────── */}
        <WebView
          source={{
            html: DAUM_POSTCODE_HTML,
            /**
             * baseUrl: WebView가 HTML을 로드할 때 사용할 origin 설정
             * 없으면 null origin으로 처리되어 외부 스크립트 로드 및
             * ReactNativeWebView 브릿지 주입이 실패할 수 있음
             */
            baseUrl: 'https://postcode.map.daum.net',
          }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          style={{ flex: 1 }}
        />

      </SafeAreaView>
    </Modal>
  )
}