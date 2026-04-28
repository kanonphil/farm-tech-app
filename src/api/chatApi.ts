import { axiosInstance } from './axiosInstance';
import { ChatRoom, ChatMessage } from '@/src/types';

// 채팅방 생성 또는 기존 방 조회
export const openOrGetRoom = async (): Promise<ChatRoom> => {
  const response = await axiosInstance.post<ChatRoom>('/chat/rooms');
  return response.data;
};

// 메시지 이력 조회
export const getMessages = async (roomId: number): Promise<ChatMessage[]> => {
  const response = await axiosInstance.get<ChatMessage[]>(`/chat/rooms/${roomId}/messages`);
  return response.data;
};