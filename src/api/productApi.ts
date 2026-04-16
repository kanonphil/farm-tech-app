/**
 * 상품 관련 API 모듈
 *
 * 웹의 product.js에서 일반 회원 앱에 필요한 기능만 추려서 작성했습니다.
 * 상품 목록/상세 조회, 카테고리, 추천 검색어, 상품별 리뷰
 *
 * 매니저 전용 기능(상품 등록/수정/삭제, 이미지 업로드)은 포함하지 않습니다.
 */

import { axiosInstance } from './axiosInstance';
import {
  ProductListItem,
  ProductDetail,
  Category,
  Review,
  ReviewStats,
} from '@/src/types';

// ─────────────────────────────────────────────
// 상품 목록
// ─────────────────────────────────────────────

/**
 * 상품 목록 조회
 * GET /products
 * @param sort      정렬 기준 (null: 기본값 / 'sales_desc': 판매량순 / 'price_asc': 낮은가격순 / 'price_desc': 높은가격순)
 * @param keyword   검색어 (null이면 전체 조회)
 * @param categoryId 카테고리 필터 (null이면 전체)
 * @returns 상품 목록 배열
 */
export const getProductList = async (
  sort: string | null = null,
  keyword: string | null = null,
  categoryId: number | null = null
): Promise<ProductListItem[]> => {
  const response = await axiosInstance.get<ProductListItem[]>('/products', {
    // params에 null 값이 들어가면 axios가 자동으로 쿼리스트링에서 제외
    params: { sort, keyword, categoryId },
  });
  return response.data;
};

/**
 * 카테고리 목록 조회
 * GET /products/category
 * @returns 카테고리 배열 (예: [{ categoryId: 1, categoryName: '한우' }, ...])
 */
export const getCategoryList = async (): Promise<Category[]> => {
  const response = await axiosInstance.get<Category[]>('/products/category');
  return response.data;
};

/**
 * 추천 검색어 조회 (검색창 자동완성용)
 * GET /products/recommended-keywords
 * @returns 추천 검색어 문자열 배열 (예: ['한우마루 등심', '한우마루 갈비', ...])
 */
export const getRecommendedKeywords = async (): Promise<string[]> => {
  const response = await axiosInstance.get<string[]>(
    '/products/recommended-keywords'
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 상품 상세
// ─────────────────────────────────────────────

/**
 * 상품 상세 조회
 * GET /products/{productId}
 * @param productId 조회할 상품 ID
 * @returns 상품 상세 정보 (이미지, 설명, 재고 포함)
 */
export const getProductDetail = async (
  productId: number
): Promise<ProductDetail> => {
  const response = await axiosInstance.get<ProductDetail>(
    `/products/${productId}`
  );
  return response.data;
};

// ─────────────────────────────────────────────
// 상품별 리뷰
// ─────────────────────────────────────────────

/**
 * 상품별 리뷰 목록 조회
 * GET /reviews/product/{productId}
 * VISIBLE 상태인 리뷰만 반환 (BLINDED 제외)
 * @param productId 조회할 상품 ID
 * @returns 리뷰 목록 배열
 */
export const getProductReviews = async (productId: number): Promise<Review[]> => {
  const response = await axiosInstance.get<Review[]>(
    `/reviews/product/${productId}`
  );
  return response.data;
};

/**
 * 상품 리뷰 통계 조회 (평균 별점, 총 리뷰 수, 별점 분포)
 * GET /reviews/all?productId=xxx
 * @param productId 조회할 상품 ID
 * @returns 리뷰 통계 정보
 */
export const getReviewStats = async (
  productId: number
): Promise<ReviewStats> => {
  const response = await axiosInstance.get<ReviewStats>('/reviews/all', {
    params: { productId },
  });
  return response.data;
};