// =============================
// 공통 타입
// =============================

/**
 * API 응답 래퍼 타입
 * 서버가 데이터를 { data: ... } 형태로 감싸서 보낼 때 사용
 * T는 실제 데이터 타입 (예: Product, Member 등)
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

// =============================
// 회원(Member) 관련 타입
// =============================

/**
 * 로그인 요청 시 서버로 보내는 데이터
 */
export interface LoginRequest {
  memberEmail: string;
  memberPw: string;
}

/**
 * 회원가입 요청 시 서버로 보내는 데이터
 * memberBirth: "YYYY-MM-DD" 형식의 문자열 (예: "1999-05-14")
 */
export interface SignupRequest {
  memberEmail: string;
  memberPw: string;
  memberName: string;
  memberPhone: string;
  memberBirth: string;
  memberAddr: string;
  memberAddrDetail: string;
}

/**
 * 서버에서 받아오는 회원 정보 (MemberDTO 기준)
 * memberStatus: 'ACTIVE' | 'WITHDRAWN' (정상 | 탈퇴)
 */
export interface Member {
  memberId: number;
  memberEmail: string;
  memberName: string;
  memberPhone: string;
  memberBirth: string;        // "YYYY-MM-DD" 형식
  memberAddr: string;
  memberAddrDetail: string;
  memberRole: 'MEMBER' | 'MANAGER';
  memberStatus: string;       // 'ACTIVE' | 'WITHDRAWN'
  memberCreatedAt: string;    // ISO 날짜 문자열
}

/**
 * 회원 정보 수정 요청 데이터
 */
export interface UpdateMemberRequest {
  memberName: string;
  memberPhone: string;
  memberBirth: string;        // "YYYY-MM-DD" 형식
  memberAddr: string;
  memberAddrDetail: string;
}

// =============================
// 상품(Product) 관련 타입
// =============================

/**
 * 상품 목록에서 보여주는 간략한 상품 정보 (ProductListDTO 기준)
 * mainImage: S3에 저장된 이미지 파일명 (URL 아님 - 실제 URL 조합 필요)
 * salesCount: 판매량 (V_PRODUCT_LIST VIEW에서 집계)
 */
export interface ProductListItem {
  productId: number;
  categoryId: number;
  productName: string;
  productPrice: number;
  productStock: number;
  productStatus: 'ACTIVE' | 'INACTIVE';
  mainImage: string;          // 이미지 파일명
  salesCount: number;
}

// ProductDetail 위에 추가
export interface ProductImage {
  imageId: number;
  productId: number;
  imageOriginName: string;
  imageSavedName: string;        // 실제 S3 URL
  imageType: 'MAIN' | 'DETAIL' | 'SUB';
  imageOrder: number;
}

/**
 * 상품 상세 페이지에서 보여주는 전체 상품 정보 (ProductDTO 기준)
 * subImgUrls: 서브 이미지 파일명 배열
 */
export interface ProductDetail {
  productId: number;
  categoryId: number;
  productName: string;
  productPrice: number;
  productStock: number;
  productDesc: string;
  productStatus: 'ACTIVE' | 'INACTIVE';
  productCreatedAt: string;
  productImageList: ProductImage[];
}

/**
 * 카테고리 정보
 */
export interface Category {
  categoryId: number;
  categoryName: string;
}

// =============================
// 장바구니(Cart) 관련 타입
// =============================

/**
 * 장바구니 상품 항목 하나 (CartItemDTO 기준)
 * product: 상품 상세 정보가 중첩된 구조로 내려옴
 */
export interface CartItem {
  cartItemId: number;
  cartId: number;
  productId: number;
  cartItemQty: number;        // 수량
  product: ProductDetail;     // 중첩된 상품 정보
}

/**
 * 장바구니 전체 정보 (CartDTO 기준)
 */
export interface Cart {
  cartId: number;
  memberId: number;
  cartItemDTOList: CartItem[];
}

/**
 * 장바구니 담기 요청 데이터
 * 백엔드가 CartItemDTO를 그대로 받으므로 필드명이 cartItemQty여야 함.
 */
export interface AddCartRequest {
  productId: number;
  cartItemQty: number;
}

/**
 * 장바구니 수량 변경 요청 데이터
 * 백엔드는 cartItemId로 항목을 찾고, cartItemQty로 수량을 변경함.
 * cartId(장바구니 ID)가 아닌 cartItemId(항목 ID)를 사용해야함.
 */
export interface UpdateCartRequest {
  cartItemId: number;
  cartItemQty: number;
}

// =============================
// 주문(Order) 관련 타입
// =============================

/**
 * 주문 상태 타입 (DB 실제 값 기준)
 * READY     → 주문 생성 (결제 전)
 * PAID      → 결제 완료
 * SHIPPING  → 배송중
 * SHIPPED   → 배송완료
 * DONE      → 구매확정
 * REFUNDED  → 환불/취소
 */
export type OrderStatus =
  | 'READY'
  | 'PAID'
  | 'SHIPPING'
  | 'SHIPPED'
  | 'DONE'
  | 'REFUNDED';

/**
 * 주문에 포함된 상품 항목 하나 (OrderItemDTO 기준)
 * imageSavedName: S3에 저장된 이미지 파일명
 * hasReview: 해당 주문 상품에 리뷰를 작성했는지 여부
 */
export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  productName: string;
  orderItemQty: number;       // 수량
  orderItemPrice: number;     // 주문 당시 가격
  imageSavedName: string;     // 이미지 파일명
  hasReview: boolean;
}

/**
 * 주문 정보 (OrderDTO 기준)
 */
export interface Order {
  orderId: number;
  memberId: number;
  tossOrderId: string;
  orderStatus: OrderStatus;
  orderTotalPrice: number;
  orderCreatedAt: string;           // ISO 날짜 문자열
  paidAt: string | null;
  shippingStartedAt: string | null;
  expectedDeliveredAt: string | null;
  shippedAt: string | null;
  confirmedAt: string | null;
  orderItemDTOList: OrderItem[];
}

/**
 * 주문 아이템 요청 DTO
 * 백엔드 OrderItemDTO와 1:1 매핑
 */
export interface OrderItemRequest {
  productId: number
  orderItemQty: number
  /** 단가 (총액 아님) */
  orderItemPrice: number
  productName: string
  /** S3 URL의 파일명 부분 (예: "image.png") */
  imageSavedName: string
}

/**
 * 주문 생성 요청 DTO
 * 백엔드 OrderRequestDTO와 1:1 매핑
 * POST /orders
 */
export interface CreateOrderRequest {
  orderDTO: {
    /** 선택된 상품 전체 합산 금액 */
    orderTotalPrice: number
    deliveryAddr: string
    deliveryAddrDetail: string
  }
  orderItemDTOList: OrderItemRequest[]
}

/**
 * 주문 생성 응답
 * 서버가 생성한 Toss 주문 ID 반환
 */
export interface CreateOrderResponse {
  tossOrderId: string
}

// =============================
// 리뷰(Review) 관련 타입
// =============================

/**
 * 리뷰 정보 (ReviewDTO 기준)
 * status: 'VISIBLE' = 정상 노출 / 'BLINDED' = AI 블라인드 처리
 * imageSavedName: 상품 이미지 파일명
 */
export interface Review {
  reviewId: number;
  memberId: number;
  memberName: string;
  productId: number;
  orderItemId: number;
  rating: number;
  content: string;
  createdAt: string;
  productName: string;
  productPrice: number;
  imageUrl: string;
  imageSavedName: string;
  status: 'VISIBLE' | 'BLINDED';
  aiLabel: 'CLEAN' | 'SUSPICIOUS' | 'TOXIC' | null;
  hasReply: boolean;
}

/**
 * 리뷰 미작성 항목 (UnreviewedItemDTO 기준)
 * 리뷰를 아직 작성하지 않은 구매 완료 상품 목록
 */
export interface UnreviewedItem {
  orderItemId: number;
  productId: number;
  productName: string;
  orderItemQty: number;
  orderItemPrice: number;
  orderDate: string;
  imageSavedName: string;
}

/**
 * 판매자 답글 (ReviewReplyDTO 기준)
 */
export interface ReviewReply {
  replyId: number;
  reviewId: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;   // 수정한 적 없으면 null
}

/**
 * 리뷰 작성/수정 요청 데이터
 */
export interface ReviewRequest {
  orderItemId: number;
  productId: number;
  rating: number;
  content: string;
}

/**
 * 상품 리뷰 통계 (별점 평균, 분포)
 */
export interface ReviewStats {
  avgRating: number;
  totalCount: number;
  ratingDistribution: Record<number, number>; // { 5: 3, 4: 1, 3: 0, 2: 0, 1: 0 }
}

// =============================
// 알림(Notification) 관련 타입
// =============================

/**
 * 서버에서 받아오는 알림 데이터 (NotificationDTO 기준)
 * isRead: 읽음 여부
 * link: 알림 클릭 시 이동할 경로 (예: "/mypage/reviews?tab=written&reviewId=5")
 */
export interface UserNotification {
  notificationId: number;
  memberId: number;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * 다음 우편번호 API 응답 타입
 * 선택 완료 시 oncomplete 콜백으로 전달되는 데이터
 */
export interface DaumAddressData {
  zonecode: string          // 우편번호 (5자리, 예: "06141")
  roadAddress: string       // 도로명 주소 (예: "서울 강남구 테헤란로 427")
  jibunAddress: string      // 지번 주소  (예: "서울 강남구 삼성동 159")
  buildingName: string      // 건물명     (예: "강남파이낸스센터")
  apartment: 'Y' | 'N'     // 아파트 여부
  sido: string              // 시/도
  sigungu: string           // 시/군/구
}

// ─────────────────────────────────────────────
// 결제 관련 타입
// ─────────────────────────────────────────────

/**
 * 결제 확인 요청 DTO
 * 백엔드 PaymentConfirmRequestDTO와 1:1 매핑
 * POST /api/payments/confirm
 */
export interface PaymentConfirmRequest {
  paymentKey: string  // Toss가 발급한 결제 키
  orderId: string     // POST /orders에서 받은 tossOrderId
  amount: number      // 결제 금액 (서버에서 위변조 검증)
}

/**
 * 결제 확인 응답 DTO
 * 백엔드 TossConfirmResponseDTO와 1:1 매핑
 */
export interface PaymentConfirmResponse {
  paymentKey: string
  orderId: string
  status: string       // 성공 시 "DONE"
  totalAmount: number
  method: string       // 결제 수단 (카드, 가상계좌 등)
}

/**
 * Toss successUrl 리다이렉트 시 전달되는 쿼리 파라미터
 */
export interface TossSuccessParams {
  paymentKey: string
  orderId: string
  amount: string  // URL 파라미터는 문자열
}