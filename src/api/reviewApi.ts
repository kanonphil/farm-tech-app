/**
 * 리뷰 관련 API 모듈
 *
 * 웹의 reviewApi.js에서 일반 회원 앱에 필요한 기능만 추려서 작성했습니다.
 * 리뷰 작성/수정/삭제, 내 리뷰 목록, 미작성 리뷰 목록, 판매자 답글 조회
 *
 * 매니저 전용 기능(전체 리뷰 조회, AI 분석, 답글 작성/수정/삭제)은 포함하지 않습니다.
 */

import { axiosInstance } from './axiosInstance';
import {
  Review,
  MyReview,
  UnreviewedItem,
  ReviewReply,
  ReviewRequest,
} from '@/src/types';

// ─────────────────────────────────────────────
// 내 리뷰 목록
// ─────────────────────────────────────────────

/**
 * 작성 완료 리뷰 목록 조회
 * GET /reviews/my?startDate=xxx&endDate=xxx
 * 로그인한 회원이 작성한 리뷰 목록을 기간 필터로 조회합니다.
 * @param startDate 조회 시작일 (예: "2026-03-15")
 * @param endDate   조회 종료일 (예: "2026-04-14")
 * @returns 내가 작성한 리뷰 목록
 */
export const getMyReviews = async (
  startDate: string,
  endDate: string
): Promise<Review[]> => {
  const response = await axiosInstance.get<Review[]>('/reviews/my', {
    params: { startDate, endDate },
  });
  return response.data;
};

/**
 * 미작성 리뷰 목록 조회 (리뷰 작성 가능한 구매 완료 상품)
 * GET /reviews/unreviewed?startDate=xxx&endDate=xxx
 * 구매확정(DONE) 상태이면서 아직 리뷰를 작성하지 않은 주문 상품 목록을 반환합니다.
 * @param startDate 조회 시작일
 * @param endDate   조회 종료일
 * @returns 리뷰 미작성 주문 상품 목록
 */
export const getUnreviewedItems = async (
  startDate: string,
  endDate: string
): Promise<UnreviewedItem[]> => {
  const response = await axiosInstance.get<UnreviewedItem[]>(
    '/reviews/unreviewed',
    { params: { startDate, endDate } }
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 리뷰 작성 / 수정 / 삭제
// ─────────────────────────────────────────────

/**
 * 리뷰 작성
 * POST /reviews
 * 구매확정(DONE) 상태의 주문 상품에 한해 작성 가능합니다.
 * @param data { orderItemId, productId, rating, content }
 */
export const createReview = async (data: ReviewRequest): Promise<void> => {
  await axiosInstance.post('/reviews', data);
};

/**
 * 리뷰 수정
 * PUT /reviews/{reviewId}
 * 본인이 작성한 리뷰만 수정 가능합니다.
 * @param reviewId 수정할 리뷰 ID
 * @param data     { orderItemId, productId, rating, content }
 */
export const updateReview = async (
  reviewId: number,
  data: ReviewRequest
): Promise<void> => {
  await axiosInstance.put(`/reviews/${reviewId}`, data);
};

/**
 * 리뷰 삭제
 * DELETE /reviews/{reviewId}
 * 본인이 작성한 리뷰만 삭제 가능합니다.
 * @param reviewId 삭제할 리뷰 ID
 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await axiosInstance.delete(`/reviews/${reviewId}`);
};

// ─────────────────────────────────────────────
// 판매자 답글 조회
// ─────────────────────────────────────────────

/**
 * 특정 리뷰의 판매자 답글 조회
 * GET /reviews/{reviewId}/reply
 * 답글이 없으면 null 또는 빈 응답이 반환됩니다.
 * @param reviewId 조회할 리뷰 ID
 * @returns 판매자 답글 정보 (없으면 null)
 */
export const getReplyByReviewId = async (
  reviewId: number
): Promise<ReviewReply | null> => {
  const response = await axiosInstance.get<ReviewReply | null>(
    `/reviews/${reviewId}/reply`
  );
  return response.data;
};