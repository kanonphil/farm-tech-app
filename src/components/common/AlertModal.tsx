/**
 * AlertModal 컴포넌트
 *
 * authStore의 alertModal 상태를 읽어서 전역 알림 모달을 표시합니다.
 * 웹 프로젝트의 AlertModal과 동일한 역할을 합니다.
 *
 * - app/_layout.tsx에서 한 번만 렌더링하면 앱 어디서든 showAlert()로 띄울 수 있습니다.
 * - 확인 버튼 클릭 시: callback 실행 → closeAlert() 순서로 호출됩니다.
 *
 * 사용 예시 (어느 컴포넌트에서든):
 *   const { showAlert } = useAuthStore();
 *   showAlert('로그아웃 하시겠습니까?', () => logout());
 * 
 * - 콜백 있을 시 confirm으로 교체
 */

import React from 'react'
import { Modal, View, Text, Pressable } from 'react-native'
import useAuthStore from '@/src/store/authStore'

const AlertModal = () => {
  const alertModal = useAuthStore((state) => state.alertModal)
  const closeAlert = useAuthStore((state) => state.closeAlert)

  // 확인 버튼 클릭 → callback 실행 → 모달 닫기
  const handleConfirm = () => {
    if (alertModal.callback) alertModal.callback()
    closeAlert()
  }

  return (
    <Modal
      visible={alertModal.show}
      transparent
      animationType="fade"
      onRequestClose={closeAlert}
    >
      {/* 딤 오버레이 */}
      <View className="flex-1 items-center justify-center bg-black/40 px-8">

        {/* 모달 카드 */}
        <View className="w-full rounded-2xl bg-white px-6 py-7">

          {/* 메시지 */}
          <Text className="mb-6 text-center text-base leading-6 text-gray-800">
            {alertModal.message}
          </Text>

          {/* callback 있으면 취소+확인, 없으면 확인만 */}
          {alertModal.callback ? (
            <View className="flex-row gap-x-3">
              {/* 취소 버튼 */}
              <Pressable
                onPress={closeAlert}
                className="flex-1 items-center rounded-xl border border-[#ddd] py-3"
                style={({ pressed }) => pressed && { opacity: 0.7 }}
              >
                <Text className="text-base font-bold text-[#888]">취소</Text>
              </Pressable>

              {/* 확인 버튼 */}
              <Pressable
                onPress={handleConfirm}
                className="flex-1 items-center rounded-xl bg-[#e63946] py-3"
                style={({ pressed }) => pressed && { opacity: 0.8 }}
              >
                <Text className="text-base font-bold text-white">확인</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleConfirm}
              className="items-center rounded-xl bg-[#e63946] py-3"
              style={({ pressed }) => pressed && { opacity: 0.8 }}
            >
              <Text className="text-base font-bold text-white">확인</Text>
            </Pressable>
          )}

        </View>
      </View>
    </Modal>
  )
}

export default AlertModal