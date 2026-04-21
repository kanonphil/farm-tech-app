import React, { useState } from 'react'
import {
  Modal, Platform, Text, TouchableOpacity, View,
} from 'react-native'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/src/constants/colors'

interface BirthDatePickerProps {
  /** "YYYY-MM-DD" 형식 문자열 */
  value: string
  onChange: (date: string) => void
  label?: string
}

/** "YYYY-MM-DD" → Date 객체 변환 (파싱 실패 시 오늘 날짜) */
function parseDate(value: string): Date {
  const d = new Date(value)
  return isNaN(d.getTime()) ? new Date() : d
}

/** Date → "YYYY-MM-DD" 문자열 변환 */
function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function BirthDatePicker({
  value,
  onChange,
  label = '생년월일',
}: BirthDatePickerProps) {
  const [visible, setVisible] = useState(false)
  /** 모달 열린 동안 임시 날짜 (확인 누르기 전까지 반영 안 함) */
  const [tempDate, setTempDate] = useState<Date>(parseDate(value))

  const handleOpen = () => {
    setTempDate(parseDate(value))
    setVisible(true)
  }

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (!selected) return
    // Android는 picker 조작 즉시 onChange가 불리므로 tempDate만 업데이트
    setTempDate(selected)
    // Android는 모달 없이 바로 닫히는 방식이라 여기서 바로 적용
    if (Platform.OS === 'android') {
      onChange(formatDate(selected))
      setVisible(false)
    }
  }

  const handleConfirm = () => {
    onChange(formatDate(tempDate))
    setVisible(false)
  }

  const maxDate = new Date()                          // 오늘 이후 선택 불가
  const minDate = new Date(maxDate.getFullYear() - 100, 0, 1) // 100년 전까지

  return (
    <>
      {/* 선택된 날짜 표시 버튼 */}
      <View className="mb-2">
        <Text className="text-sm font-medium text-[#333] mb-1">{label}</Text>
        <TouchableOpacity
          onPress={handleOpen}
          className="flex-row items-center justify-between rounded-lg border border-[#ddd] px-3 py-2.5"
        >
          <Text className={value ? 'text-sm text-[#1a1a1a]' : 'text-sm text-[#bbb]'}>
            {value || '생년월일을 선택해주세요'}
          </Text>
          <Ionicons name="calendar-outline" size={18} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* iOS: 모달로 드럼롤 표시 */}
      {Platform.OS === 'ios' && (
        <Modal visible={visible} transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 bg-black/40"
            activeOpacity={1}
            onPress={() => setVisible(false)}
          />
          <View className="bg-white rounded-t-2xl px-4 pb-8">
            {/* 모달 헤더 */}
            <View className="flex-row items-center justify-between py-4">
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text className="text-sm text-[#888]">취소</Text>
              </TouchableOpacity>
              <Text className="text-base font-semibold text-[#1a1a1a]">생년월일</Text>
              <TouchableOpacity onPress={handleConfirm}>
                <Text className="text-sm font-semibold" style={{ color: Colors.primary }}>
                  확인
                </Text>
              </TouchableOpacity>
            </View>
            {/* 드럼롤 Picker */}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              locale="ko-KR"
            />
          </View>
        </Modal>
      )}

      {/* Android: display="spinner"는 네이티브 다이얼로그로 표시 */}
      {Platform.OS === 'android' && visible && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={handleChange}
          maximumDate={maxDate}
          minimumDate={minDate}
        />
      )}
    </>
  )
}