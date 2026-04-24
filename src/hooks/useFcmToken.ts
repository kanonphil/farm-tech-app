import { useEffect } from "react";
import useAuthStore from "../store/authStore";
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { saveFcmToken} from '@/src/api/authApi';

export function useFcmToken() {
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if(!token) return; //로그인 상태일 때만 실행
    // if(!Device.isDevice) return; //실제 기기에서만 (에뮬레이터 제외)

    async function registerFcm() {
      //알림 권한 요청
      const {status} = await Notifications.requestPermissionsAsync();
      if(status !== 'granted')  return;

      // FCM 토큰 ㄴ발급
      const tokenData = await Notifications.getDevicePushTokenAsync();

      //백엔드에 저장
      await saveFcmToken(tokenData.data);
    }
    registerFcm();
  },[token]); //로그인할 때마다 실행

}