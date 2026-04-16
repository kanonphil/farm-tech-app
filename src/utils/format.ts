/**
 * 한우마루 앱 공통 포맷 유틸리티
 *
 * 날짜, 숫자, 전화번호 등 화면에 표시할 때
 * 반복적으로 필요한 변환 함수들을 모아둔 파일입니다.
 *
 * 사용 예시:
 *   import { formatPrice, formatDate, formatPhone } from '@/src/utils/format'
 */

/**
 * 숫자를 한국 원화 형식으로 변환합니다.
 *
 * @param price 가격 (숫자)
 * @returns "1,000원" 형식의 문자열
 *
 * 예시: formatPrice(15000) → "15,000원"
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원'
}

/**
 * ISO 날짜 문자열을 "YYYY.MM.DD" 형식으로 변환합니다.
 *
 * @param dateStr ISO 날짜 문자열 (예: "2024-03-15T12:00:00")
 * @returns "2024.03.15" 형식의 문자열
 *
 * 예시: formatDate("2024-03-15T12:00:00") → "2024.03.15"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}`
}

/**
 * ISO 날짜 문자열을 "YYYY.MM.DD HH:mm" 형식으로 변환합니다.
 * 시간까지 표시해야 하는 경우(주문 일시, 알림 등)에 사용합니다.
 *
 * @param dateStr ISO 날짜 문자열
 * @returns "2024.03.15 14:30" 형식의 문자열
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}

/**
 * "YYYY-MM-DD" 생년월일 문자열을 "YYYY년 MM월 DD일" 형식으로 변환합니다.
 * 프로필 화면에서 생년월일 표시 시 사용합니다.
 *
 * @param birth "YYYY-MM-DD" 형식 문자열
 * @returns "1999년 05월 14일" 형식의 문자열
 */
export function formatBirth(birth: string): string {
  const [yyyy, mm, dd] = birth.split('-')
  return `${yyyy}년 ${mm}월 ${dd}일`
}

/**
 * 전화번호 문자열에 하이픈을 추가합니다.
 * DB에는 하이픈 없이 저장되어 있을 수 있으므로 화면 표시 시 사용합니다.
 *
 * @param phone 전화번호 문자열 (예: "01012345678")
 * @returns "010-1234-5678" 형식의 문자열
 *
 * 예시: formatPhone("01012345678") → "010-1234-5678"
 */
export function formatPhone(phone: string): string {
  // 숫자만 추출
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 11) {
    // 010-0000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  } else if (digits.length === 10) {
    // 02-000-0000 또는 031-000-0000
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  // 형식에 맞지 않으면 원본 반환
  return phone
}

/**
 * 주문 상태 코드를 한글 텍스트로 변환합니다.
 *
 * @param status OrderStatus 값
 * @returns 한글 상태 텍스트
 *
 * 예시: formatOrderStatus("PAID") → "결제완료"
 */
export function formatOrderStatus(
  status: 'READY' | 'PAID' | 'SHIPPING' | 'SHIPPED' | 'DONE' | 'REFUNDED'
): string {
  const map: Record<string, string> = {
    READY:    '주문대기',
    PAID:     '결제완료',
    SHIPPING: '배송중',
    SHIPPED:  '배송완료',
    DONE:     '구매확정',
    REFUNDED: '환불/취소',
  }
  return map[status] ?? status
}