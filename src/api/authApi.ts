/**
 * 인증 관련 API 모듈
 *
 * 웹의 memberApi.js에서 일반 회원 앱에 필요한 기능만 추려서 TypeScript로 작성했습니다.
 * 회원가입, 로그인, 로그아웃, 내 정보 조회/수정, 비밀번호 변경, 회원 탈퇴
 *
 * 참고: 아이디 찾기, 비밀번호 찾기는 토큰 없이 호출하는 API라
 *       axiosInstance 대신 기본 axios를 사용합니다.
 */

import axios from 'axios';
import { axiosInstance } from './axiosInstance';
import {
  LoginRequest,
  SignupRequest,
  Member,
  UpdateMemberRequest,
} from '@/src/types';
import { BASE_URL } from '../constants';

// ─────────────────────────────────────────────
// 회원가입 / 이메일 중복 확인
// ─────────────────────────────────────────────

/**
 * 회원가입
 * POST /members
 * 토큰 없이 호출하므로 기본 axios 사용
 * @param data 회원가입 폼 데이터
 */
export const registerMember = async (data: SignupRequest): Promise<void> => {
  await axios.post(`${BASE_URL}/members`, data);
};

/**
 * 이메일 중복 확인
 * GET /members/check-email?memEmail=xxx
 * @param email 확인할 이메일
 * @returns true = 이미 사용 중, false = 사용 가능
 */
export const checkEmailDuplicate = async (email: string): Promise<boolean> => {
  const response = await axios.get(`${BASE_URL}/members/check-email`, {
    params: { memEmail: email },
  });
  return response.data;
};

// ─────────────────────────────────────────────
// 로그인 / 로그아웃
// ─────────────────────────────────────────────

/**
 * 로그인
 * POST /members/login
 * 성공 시 응답 헤더의 Authorization에서 Access Token을 꺼내야 합니다.
 * 호출하는 쪽에서 response.headers['authorization']으로 토큰 추출 후 setToken() 호출
 * @param data 로그인 폼 데이터
 */
export const login = async (data: LoginRequest) => {
  const response = await axiosInstance.post('/members/login', {
    ...data,
    autoLogin:true //앱은 항상 자동로그인
  });
  // refresh token은 호출부(login.tsx)에서 response.headers['refresh-token']으로 꺼냄
  return response;
};

/**
 * 로그아웃
 * POST /members/logout
 * 서버에서 Refresh Token 삭제 처리
 */
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/members/logout');
};

/**
 * 앱 시작 시 Refresh Token으로 Access Token 재발급 (자동 로그인)
 * POST /members/refresh
 * 성공 시 응답 헤더의 Authorization에서 새 Access Token 추출
 */
export const silentRefresh = async () => {
  const response = await axiosInstance.post('/members/refresh');
  return response;
};

// ─────────────────────────────────────────────
// 내 정보
// ─────────────────────────────────────────────

/**
 * 내 정보 전체 조회
 * GET /members/user
 * @returns 로그인한 회원의 전체 정보
 */
export const getMyInfo = async (): Promise<Member> => {
  const response = await axiosInstance.get<Member>('/members/user');
  return response.data;
};

/**
 * 내 정보 수정 (이름, 전화번호, 생년월일, 주소)
 * PUT /members/set-info
 * @param data 수정할 회원 정보
 */
export const updateMyInfo = async (data: UpdateMemberRequest): Promise<void> => {
  await axiosInstance.put('/members/set-info', data);
};

/**
 * 비밀번호 확인 (정보 수정 전 본인 인증용)
 * POST /members/confirm-pw
 * @param memberPw 현재 비밀번호
 */
export const confirmPassword = async (memberPw: string): Promise<void> => {
  await axiosInstance.post('/members/confirm-pw', { memberPw });
};

/**
 * 비밀번호 변경
 * PATCH /members/set-pw
 * @param data { currentPw: 현재 비밀번호, newPw: 새 비밀번호 }
 */
export const changePassword = async (data: {
  currentPw: string;
  newPw: string;
}): Promise<void> => {
  await axiosInstance.patch('/members/set-pw', data);
};

/**
 * 회원 탈퇴
 * PATCH /members/withdraw
 */
export const withdrawMember = async (): Promise<void> => {
  await axiosInstance.patch('/members/withdraw');
};

// ─────────────────────────────────────────────
// 아이디 찾기 / 비밀번호 찾기
// ─────────────────────────────────────────────

/**
 * 아이디 찾기 — 이름 + 전화번호로 마스킹된 이메일 반환
 * POST /members/find-email
 * @param memberName 이름
 * @param memberPhone 전화번호
 * @returns 마스킹된 이메일 (예: "ho***@gmail.com")
 */
export const findEmail = async (
  memberName: string,
  memberPhone: string
): Promise<string> => {
  const response = await axios.post(`${BASE_URL}/members/find-email`, {
    memberName,
    memberPhone,
  });
  return response.data;
};

/**
 * 비밀번호 찾기 Step 1 — 계정 정보 확인
 * POST /members/verify-account
 * @param memberEmail 이메일
 * @param memberName 이름
 * @param memberPhone 전화번호
 */
export const verifyAccount = async (
  memberEmail: string,
  memberName: string,
  memberPhone: string
): Promise<void> => {
  await axios.post(`${BASE_URL}/members/verify-account`, {
    memberEmail,
    memberName,
    memberPhone,
  });
};

/**
 * 비밀번호 찾기 Step 2 — 비밀번호 재설정
 * PATCH /members/reset-pw
 * @param data { memberEmail, memberName, memberPhone, memberPw }
 */
export const resetPassword = async (data: {
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  memberPw: string;
}): Promise<void> => {
  await axios.patch(`${BASE_URL}/members/reset-pw`, data);
};

export const saveFcmToken = (fcmToken : string) => axiosInstance.post('/members/fcm-token', {fcmToken});