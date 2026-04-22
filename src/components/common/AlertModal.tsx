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
 */

import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import useAuthStore from '@/src/store/authStore';

/**
 * 전역 알림 모달 컴포넌트
 * StyleSheet 없이 NativeWind(Tailwind) className만 사용합니다.
 */
const AlertModal = () => {
  // authStore에서 모달 상태와 닫기 액션을 가져옵니다
  const alertModal = useAuthStore((state) => state.alertModal);
  const closeAlert = useAuthStore((state) => state.closeAlert);

  /**
   * 확인 버튼 클릭 핸들러
   * callback이 있으면 먼저 실행하고, 그다음 모달을 닫습니다.
   */
  const HandleConfirm = () => {
    // callback이 존재하면 실행 (예: 로그아웃, 삭제 등 후속 동작)
    if (alertModal.callback) {
      alertModal.callback();
    }
    // 모달 닫기 (상태를 초기값으로 리셋)
    closeAlert();
  };

  return (
    // React Native의 Modal 컴포넌트
    // visible: alertModal.show가 true일 때만 화면에 표시됩니다
    // transparent: 배경을 반투명하게 처리
    // animationType: 'fade'로 부드럽게 등장/퇴장
    <Modal
      visible={alertModal.show}
      transparent
      animationType="fade"
      // 하드웨어 뒤로가기(안드로이드) 눌렀을 때도 닫히도록
      onRequestClose={closeAlert}
    >
      {/* 반투명 딤(dim) 오버레이 — 모달 바깥 영역 */}
      {/* Pressable로 감싸면 모달 바깥 탭 시 닫히게 할 수 있습니다 (현재는 비활성) */}
      <View className="flex-1 items-center justify-center bg-black/40 px-8">

        {/* 흰 카드 — 실제 모달 내용 */}
        <View className="w-full rounded-2xl bg-white px-6 py-7">

          {/* 메시지 텍스트 */}
          <Text className="mb-6 text-center text-base leading-6 text-gray-800">
            {alertModal.message}
          </Text>

          {/* 확인 버튼 — Colors.primary(#e63946) 배경 */}
          <Pressable
            className="items-center rounded-xl bg-[#e63946] py-3"
            onPress={HandleConfirm}
            style={({ pressed }) => pressed && { opacity: 0.8 }}
          >
            <Text className="text-base font-bold text-white">확인</Text>
          </Pressable>

        </View>
      </View>
    </Modal>
  );
};

export default AlertModal;
