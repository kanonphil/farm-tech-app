import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import ScreenWrapper from '@/src/components/common/ScreenWrapper'
import LoadingSpinner from '@/src/components/common/LoadingSpinner'
import useAuthStore from '@/src/store/authStore'
import useRequireAuth from '@/src/hooks/useRequireAuth'
import { Ionicons } from '@expo/vector-icons'
import { router, useFocusEffect } from 'expo-router'
import {
  getAllPresets, createPreset, updatePreset, deletePreset, activatePreset,
  ThresholdPreset, ThresholdPresetInput,
} from '@/src/api/thresholdApi'

const EMPTY_FORM: ThresholdPresetInput = {
  name: '', tempLow: 18, tempHigh: 28,
  humLow: 40, humHigh: 80,
  airPpmLow: 300, airPpmBad: 500,
  luxLow: 1000, luxHigh: 8000,
}

// ── 입력 행 (하한~상한) ────────────────────────────────────────

function RangeRow({ label, unit, low, high, lowKey, highKey, onChange }: {
  label: string; unit: string
  low: number; high: number
  lowKey: keyof ThresholdPresetInput; highKey: keyof ThresholdPresetInput
  onChange: (k: keyof ThresholdPresetInput, v: string) => void
}) {
  return (
    <View className='mb-4'>
      <Text className='text-xs font-semibold text-gray-500 mb-2'>{label} ({unit})</Text>
      <View className='flex-row gap-2 items-center'>
        <TextInput
          className='flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800'
          keyboardType='numeric' value={String(low)} placeholder='하한'
          placeholderTextColor='#9ca3af'
          onChangeText={(v) => onChange(lowKey, v)}
        />
        <Text className='text-gray-400 text-sm'>~</Text>
        <TextInput
          className='flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800'
          keyboardType='numeric' value={String(high)} placeholder='상한'
          placeholderTextColor='#9ca3af'
          onChangeText={(v) => onChange(highKey, v)}
        />
      </View>
    </View>
  )
}

// ── 메인 화면 ─────────────────────────────────────────────────

export default function ThresholdScreen() {
  const { isLoggedIn, isReady } = useRequireAuth()
  const role = useAuthStore((s) => s.role)
  const { showToast, showAlert } = useAuthStore()

  const [presets,    setPresets]    = useState<ThresholdPreset[]>([])
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId,    setEditingId]    = useState<number | null>(null)
  const [form, setForm] = useState<ThresholdPresetInput>(EMPTY_FORM)

  useEffect(() => {
    if (isReady && isLoggedIn && role !== 'MANAGER') router.replace('/(tabs)/home' as any)
  }, [isReady, isLoggedIn, role])

  const loadPresets = useCallback(async () => {
    setLoading(true)
    try { setPresets(await getAllPresets()) }
    catch { showToast('목록을 불러오지 못했습니다.') }
    finally { setLoading(false) }
  }, [showToast])

  useFocusEffect(useCallback(() => {
    if (isReady && isLoggedIn && role === 'MANAGER') loadPresets()
  }, [isReady, isLoggedIn, role, loadPresets]))

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalVisible(true) }
  const openEdit   = (p: ThresholdPreset) => {
    setEditingId(p.id)
    setForm({ name: p.name, tempLow: p.tempLow, tempHigh: p.tempHigh,
      humLow: p.humLow, humHigh: p.humHigh,
      airPpmLow: p.airPpmLow, airPpmBad: p.airPpmBad,
      luxLow: p.luxLow, luxHigh: p.luxHigh })
    setModalVisible(true)
  }

  const handleFormChange = (k: keyof ThresholdPresetInput, v: string) =>
    setForm(prev => ({ ...prev, [k]: k === 'name' ? v : (parseFloat(v) || 0) }))

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) { showToast('프리셋 이름을 입력해주세요.'); return }
    setSubmitting(true)
    try {
      editingId === null ? await createPreset(form) : await updatePreset(editingId, form)
      showToast(editingId === null ? '프리셋이 생성되었습니다.' : '수정되었습니다.')
      setModalVisible(false); loadPresets()
    } catch { showToast('저장에 실패했습니다.') }
    finally   { setSubmitting(false) }
  }, [form, editingId, showToast, loadPresets])

  const handleActivate = useCallback((p: ThresholdPreset) => {
    if (p.isActive) return
    showAlert(`'${p.name}' 프리셋을 활성화할까요?\n기기에 즉시 적용됩니다.`, async () => {
      setSubmitting(true)
      try { await activatePreset(p.id); showToast('활성화되었습니다.'); loadPresets() }
      catch { showToast('활성화에 실패했습니다.') }
      finally { setSubmitting(false) }
    })
  }, [showAlert, showToast, loadPresets])

  const handleDelete = useCallback((p: ThresholdPreset) => {
    if (p.isActive) { showToast('활성 프리셋은 삭제할 수 없습니다.'); return }
    showAlert(`'${p.name}' 프리셋을 삭제할까요?`, async () => {
      setSubmitting(true)
      try { await deletePreset(p.id); showToast('삭제되었습니다.'); loadPresets() }
      catch { showToast('삭제에 실패했습니다.') }
      finally { setSubmitting(false) }
    })
  }, [showAlert, showToast, loadPresets])

  if (!isReady || !isLoggedIn || role !== 'MANAGER') return <LoadingSpinner full />
  if (loading) return <LoadingSpinner full />

  return (
    <ScreenWrapper scroll>
      <View className='px-5 pt-5 pb-4 flex-row items-center justify-between'>
        <View>
          <Text className='text-2xl font-bold text-gray-900'>임계값 설정</Text>
          <Text className='text-sm text-gray-400 mt-1'>자동 제어 기준값 관리</Text>
        </View>
        <Pressable onPress={openCreate} className='flex-row items-center gap-1 bg-primary px-3 py-2 rounded-xl'
          style={({ pressed }) => pressed && { opacity: 0.8 }}>
          <Ionicons name='add' size={16} color='#fff' />
          <Text className='text-xs font-semibold text-white'>새 프리셋</Text>
        </Pressable>
      </View>

      <View className='px-5 pb-8'>
        {presets.length === 0 ? (
          <View className='bg-white rounded-2xl border border-gray-100 p-10 items-center'>
            <Ionicons name='settings-outline' size={40} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-3'>프리셋이 없습니다</Text>
            <Pressable onPress={openCreate} className='mt-4 px-6 py-2.5 bg-primary rounded-xl'>
              <Text className='text-sm font-semibold text-white'>첫 프리셋 만들기</Text>
            </Pressable>
          </View>
        ) : presets.map((p) => (
          <View key={p.id} className={`bg-white rounded-2xl border mb-3 p-4 ${p.isActive ? 'border-green-300' : 'border-gray-100'}`}>
            <View className='flex-row items-center justify-between mb-3'>
              <View className='flex-row items-center gap-2'>
                {p.isActive && <View className='w-2 h-2 rounded-full bg-green-500' />}
                <Text className='text-sm font-semibold text-gray-900'>{p.name}</Text>
                {p.isActive && <View className='bg-green-100 px-2 py-0.5 rounded-full'><Text className='text-xs text-green-600 font-medium'>활성</Text></View>}
              </View>
              <View className='flex-row gap-2'>
                <Pressable onPress={() => openEdit(p)} className='p-1.5 bg-gray-100 rounded-lg'>
                  <Ionicons name='pencil-outline' size={14} color='#6b7280' />
                </Pressable>
                <Pressable onPress={() => handleDelete(p)} className='p-1.5 bg-red-50 rounded-lg'>
                  <Ionicons name='trash-outline' size={14} color='#ef4444' />
                </Pressable>
              </View>
            </View>

            <View className='gap-y-2 mb-3'>
              <View className='flex-row gap-2'>
                <View className='flex-1 bg-amber-50 rounded-xl p-2.5'><Text className='text-xs text-gray-400'>온도</Text><Text className='text-xs font-semibold text-gray-700'>{p.tempLow} ~ {p.tempHigh} °C</Text></View>
                <View className='flex-1 bg-blue-50 rounded-xl p-2.5'><Text className='text-xs text-gray-400'>습도</Text><Text className='text-xs font-semibold text-gray-700'>{p.humLow} ~ {p.humHigh} %</Text></View>
              </View>
              <View className='flex-row gap-2'>
                <View className='flex-1 bg-yellow-50 rounded-xl p-2.5'><Text className='text-xs text-gray-400'>조도</Text><Text className='text-xs font-semibold text-gray-700'>{p.luxLow} ~ {p.luxHigh} lux</Text></View>
                <View className='flex-1 bg-green-50 rounded-xl p-2.5'><Text className='text-xs text-gray-400'>대기질</Text><Text className='text-xs font-semibold text-gray-700'>{p.airPpmLow} / {p.airPpmBad} raw</Text></View>
              </View>
            </View>

            {!p.isActive && (
              <Pressable onPress={() => handleActivate(p)} disabled={submitting}
                className='py-2.5 rounded-xl bg-gray-100 items-center'
                style={({ pressed }) => pressed && { opacity: 0.7 }}>
                <Text className='text-xs font-semibold text-gray-600'>이 프리셋 적용하기</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* 생성/수정 모달 */}
      <Modal visible={modalVisible} animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setModalVisible(false)}>
        <View className='flex-1 bg-white'>
          <View className='flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-gray-100'>
            <Text className='text-lg font-bold text-gray-900'>{editingId === null ? '새 프리셋' : '프리셋 수정'}</Text>
            <Pressable onPress={() => setModalVisible(false)} className='p-2'>
              <Ionicons name='close' size={22} color='#6b7280' />
            </Pressable>
          </View>

          <ScrollView className='flex-1 px-5 pt-5'>
            <View className='mb-4'>
              <Text className='text-xs font-semibold text-gray-500 mb-2'>프리셋 이름</Text>
              <TextInput
                className='bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800'
                value={form.name} placeholder='예: 기본값, 여름, 겨울'
                placeholderTextColor='#9ca3af'
                onChangeText={(v) => handleFormChange('name', v)}
              />
            </View>

            <RangeRow label='온도' unit='°C'  low={form.tempLow} high={form.tempHigh} lowKey='tempLow' highKey='tempHigh' onChange={handleFormChange} />
            <RangeRow label='습도' unit='%'   low={form.humLow}  high={form.humHigh}  lowKey='humLow'  highKey='humHigh'  onChange={handleFormChange} />
            <RangeRow label='조도' unit='lux' low={form.luxLow}  high={form.luxHigh}  lowKey='luxLow'  highKey='luxHigh'  onChange={handleFormChange} />

            <View className='mb-6'>
              <Text className='text-xs font-semibold text-gray-500 mb-2'>대기질 (raw)</Text>
              <View className='flex-row gap-2'>
                <View className='flex-1'>
                  <Text className='text-xs text-gray-400 mb-1'>주의 기준</Text>
                  <TextInput className='bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800'
                    keyboardType='numeric' value={String(form.airPpmLow)} placeholder='300'
                    placeholderTextColor='#9ca3af'
                    onChangeText={(v) => handleFormChange('airPpmLow', v)} />
                </View>
                <View className='flex-1'>
                  <Text className='text-xs text-gray-400 mb-1'>위험 기준</Text>
                  <TextInput className='bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800'
                    keyboardType='numeric' value={String(form.airPpmBad)} placeholder='500'
                    placeholderTextColor='#9ca3af'
                    onChangeText={(v) => handleFormChange('airPpmBad', v)} />
                </View>
              </View>
            </View>

            <Pressable onPress={handleSave} disabled={submitting}
              className='bg-primary py-4 rounded-2xl items-center mb-8'
              style={({ pressed }) => pressed && { opacity: 0.8 }}>
              {submitting
                ? <ActivityIndicator size='small' color='#fff' />
                : <Text className='text-sm font-bold text-white'>{editingId === null ? '프리셋 생성' : '수정 저장'}</Text>
              }
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}