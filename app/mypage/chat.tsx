import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Client } from '@stomp/stompjs'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { openOrGetRoom, getMessages } from '@/src/api/chatApi'
import { ChatMessage, ChatRoom } from '@/src/types'
import useAuthStore from '@/src/store/authStore'
import { Colors } from '@/src/constants/colors'
import { BASE_URL } from '@/src/constants'

const WS_URL = BASE_URL.replace('http', 'ws') + '/ws/chat'

export default function ChatScreen() {
  const token = useAuthStore((s) => s.token)
  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const clientRef = useRef<Client | null>(null)
  const flatListRef = useRef<FlatList>(null)

  // 채팅방 로드 + WebSocket 연결
  useEffect(() => {
    let client: Client

    const init = async () => {
      try {
        const chatRoom = await openOrGetRoom()
        setRoom(chatRoom)

        const history = await getMessages(chatRoom.roomId)
        setMessages(history)

        client = new Client({
          webSocketFactory: () => new WebSocket(WS_URL),
          forceBinaryWSFrames: true,  
          appendMissingNULLonIncoming: true,
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 3000,
          onConnect: () => {
            setConnected(true)
            client.subscribe(`/topic/chat/${chatRoom.roomId}`, (msg) => {
              const newMsg: ChatMessage = JSON.parse(msg.body)

              if (newMsg.messageType === 'CLOSE') {
                // 채팅방 종료 처리
                setRoom((prev) => prev ? { ...prev, status: 'CLOSED' } : prev)
                setMessages((prev) => [...prev, newMsg])
                return
              }

              setMessages((prev) => [...prev, newMsg])
            })
          },
          onDisconnect: () => setConnected(false),
        })

        client.activate()
        clientRef.current = client
      } catch {
        // 연결 실패
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => { client?.deactivate() }
  }, [])

  // 새 메시지 오면 스크롤 아래로
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !room || !clientRef.current?.connected) return

    const dto = {
      roomId: room.roomId,
      senderRole: 'MEMBER',
      content: input.trim(),
    }

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(dto),
    })
    setInput('')
  }

  const handleNewRoom = async () => {
    // 기존 WebSocket 연결 끊기
    clientRef.current?.deactivate()
    setConnected(false)
    setMessages([])
    setLoading(true)

    try {
      const chatRoom = await openOrGetRoom()
      setRoom(chatRoom)

      const history = await getMessages(chatRoom.roomId)
      setMessages(history)

      const client = new Client({
        webSocketFactory: () => new WebSocket(WS_URL),
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 3000,
        onConnect: () => {
          setConnected(true)
          client.subscribe(`/topic/chat/${chatRoom.roomId}`, (msg) => {
            const newMsg: ChatMessage = JSON.parse(msg.body)
            if (newMsg.messageType === 'CLOSE') {
              setRoom((prev) => prev ? { ...prev, status: 'CLOSED' } : prev)
              setMessages((prev) => [...prev, newMsg])
              return
            }
            setMessages((prev) => [...prev, newMsg])
          })
        },
        onDisconnect: () => setConnected(false),
      })

      client.activate()
      clientRef.current = client
    } catch {
      // 연결 실패
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={Colors.primary} />
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* 헤더 */}
      <View className="flex-row items-center px-4 py-3 border-b border-[#eee] bg-white">
        <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && { opacity: 0.7 }}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text className="ml-2 text-base font-bold text-[#1a1a1a]">1:1 문의</Text>
        <View
          className="ml-auto px-2 py-0.5 rounded-full"
          style={{ backgroundColor: connected ? '#E1F5EE' : '#f3f4f6' }}
        >
          <Text className="text-[10px]" style={{ color: connected ? '#0F6E56' : '#aaa' }}>
            {connected ? '연결됨' : '연결 중...'}
          </Text>
        </View>
      </View>

      {/* 메시지 목록 */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, i) => item.messageId?.toString() ?? i.toString()}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => {
          const isMine = item.senderRole === 'MEMBER'
          return (
            <View className={`flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <View className="h-8 w-8 rounded-full bg-[#f0f0f0] items-center justify-center mr-2">
                  <Ionicons name="headset-outline" size={16} color="#888" />
                </View>
              )}
              <View
                className="max-w-[70%] px-3 py-2 rounded-2xl"
                style={{
                  backgroundColor: isMine ? Colors.primary : '#f3f4f6',
                  borderBottomRightRadius: isMine ? 4 : 16,
                  borderBottomLeftRadius: isMine ? 16 : 4,
                }}
              >
                <Text style={{ color: isMine ? '#fff' : '#1a1a1a' }} className="text-sm">
                  {item.content}
                </Text>
                <Text
                  className="text-[10px] mt-1"
                  style={{ color: isMine ? 'rgba(255,255,255,0.7)' : '#aaa' }}
                >
                  {item.createdAt?.slice(11, 16)}
                </Text>
              </View>
            </View>
          )
        }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="chatbubble-outline" size={48} color="#ddd" />
            <Text className="mt-3 text-sm text-[#bbb]">문의 내용을 입력해주세요</Text>
          </View>
        }
      />

     {/* 입력창 */}
    {room?.status === 'CLOSED' ? (
      <View className="py-4 items-center border-t border-[#eee]">
        <Text className="text-sm text-[#aaa] mb-2">종료된 문의입니다</Text>
        <Pressable
          onPress={handleNewRoom}
          className="px-4 py-2 rounded-full"
          style={{ backgroundColor: Colors.primary }}
        >
          <Text className="text-white text-sm font-bold">새 문의 시작하기</Text>
        </Pressable>
      </View>
    ) : (
      <View className="flex-row items-center px-4 py-3 border-t border-[#eee] bg-white">
        <TextInput
          className="flex-1 bg-[#f3f4f6] rounded-full px-4 py-2 text-sm text-[#1a1a1a]"
          placeholder="메시지를 입력하세요..."
          placeholderTextColor="#aaa"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          multiline
        />
        <Pressable
          onPress={sendMessage}
          className="ml-2 h-10 w-10 rounded-full items-center justify-center"
          style={{ backgroundColor: input.trim() ? Colors.primary : '#e5e7eb' }}
        >
          <Ionicons name="send" size={18} color={input.trim() ? '#fff' : '#aaa'} />
        </Pressable>
      </View>
    )}
    </KeyboardAvoidingView>
  )
}