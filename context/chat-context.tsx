"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from "react"
import { User, Message, ChatRoom, WebSocketMessage } from "@/types"
import { api } from "@/lib/api"
import { useAuth } from "./auth-context"

type ChatContextType = {
    activeChat: ChatRoom | null
    chatRooms: ChatRoom[]
    messages: Message[]
    isLoading: boolean
    sendMessage: (receiverId: string, content: string) => Promise<Message>
    shareSong: (songId: string, receiverId: string, content: string) => Promise<Message>
    sharePlaylist: (playlistId: string, receiverId: string, content: string) => Promise<Message>
    setActiveChat: (chat: ChatRoom | null) => void
    isConnected: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
    const { user, accessToken } = useAuth()
    const [activeChat, setActiveChat] = useState<ChatRoom | null>(null)
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const socketRef = useRef<WebSocket | null>(null)

    // Hàm để cập nhật danh sách phòng chat từ tin nhắn
    const updateChatRooms = useCallback((allMessages: Message[]) => {
        if (!user) return

        const roomsMap = new Map<string, ChatRoom>()

        // Lọc tin nhắn và tạo các phòng chat
        allMessages.forEach(message => {
            const isUserSender = message.sender.id === user.id
            const partner = isUserSender ? message.receiver : message.sender
            const roomId = `room_${user.id}_${partner.id}`

            if (!roomsMap.has(roomId)) {
                roomsMap.set(roomId, {
                    id: roomId,
                    partner,
                    lastMessage: message,
                    unreadCount: (!isUserSender && !message.is_read) ? 1 : 0
                })
            } else {
                const existingRoom = roomsMap.get(roomId)!

                // Cập nhật tin nhắn mới nhất nếu cần
                const existingTimestamp = new Date(existingRoom.lastMessage?.timestamp || 0).getTime()
                const newTimestamp = new Date(message.timestamp).getTime()

                if (newTimestamp > existingTimestamp) {
                    existingRoom.lastMessage = message
                }

                // Cập nhật số tin nhắn chưa đọc
                if (!isUserSender && !message.is_read) {
                    existingRoom.unreadCount += 1
                }

                roomsMap.set(roomId, existingRoom)
            }
        })

        // Chuyển map thành mảng và sắp xếp theo thời gian tin nhắn mới nhất
        const rooms = Array.from(roomsMap.values()).sort((a, b) => {
            const timeA = new Date(a.lastMessage?.timestamp || 0).getTime()
            const timeB = new Date(b.lastMessage?.timestamp || 0).getTime()
            return timeB - timeA
        })

        setChatRooms(rooms)
    }, [user])

    // Tải tin nhắn từ API
    useEffect(() => {
        if (!user || !accessToken) return

        const fetchMessages = async () => {
            setIsLoading(true)
            try {
                const data = await api.chat.getMessages()
                const allMessages = [...data.received, ...data.sent].sort(
                    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                )

                updateChatRooms(allMessages)

                // Nếu có active chat, lọc tin nhắn cho chat đó
                if (activeChat) {
                    const chatMessages = allMessages.filter(msg =>
                        (msg.sender.id === user.id && msg.receiver.id === activeChat.partner.id) ||
                        (msg.receiver.id === user.id && msg.sender.id === activeChat.partner.id)
                    )
                    setMessages(chatMessages)
                }
            } catch (error) {
                console.error("Lỗi khi tải tin nhắn:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchMessages()
    }, [user, accessToken, activeChat, updateChatRooms])

    // Thiết lập kết nối WebSocket khi active chat thay đổi
    useEffect(() => {
        if (!user || !activeChat || !accessToken) {
            if (socketRef.current) {
                socketRef.current.close()
                socketRef.current = null
                setIsConnected(false)
            }
            return
        }

        // Đóng kết nối cũ nếu có
        if (socketRef.current) {
            socketRef.current.close()
        }

        // Tạo room name từ ID người dùng và partner
        const roomName = `private_${user.id}_${activeChat.partner.id}`

        // Tạo kết nối WebSocket mới
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/chat/${roomName}/?token=${accessToken}`

        socketRef.current = new WebSocket(wsUrl)

        // Xử lý sự kiện WebSocket
        socketRef.current.onopen = () => {
            console.log('WebSocket connection established')
            setIsConnected(true)
        }

        socketRef.current.onmessage = (event) => {
            const data: WebSocketMessage = JSON.parse(event.data)

            // Xử lý tin nhắn mới nhận được
            if (data.message && data.sender_id && data.timestamp) {
                // Tìm thông tin người gửi từ user hiện tại hoặc partner
                const sender = data.sender_id === user.id ? user : activeChat.partner
                const receiver = data.sender_id === user.id ? activeChat.partner : user

                // Tạo đối tượng tin nhắn mới
                const newMessage: Message = {
                    id: Date.now(), // Tạm thời dùng timestamp làm ID
                    sender,
                    receiver,
                    content: data.message,
                    timestamp: data.timestamp,
                    is_read: sender.id !== user.id, // Tự động đánh dấu là đã đọc nếu người dùng hiện tại không phải người gửi
                    message_type: 'TEXT',
                    shared_song: null,
                    shared_playlist: null,
                    attachment: null,
                    image: null,
                    voice_note: null
                }

                // Cập nhật danh sách tin nhắn
                setMessages(prev => [...prev, newMessage])

                // Cập nhật chat room với tin nhắn mới nhất
                setChatRooms(prev => {
                    const updatedRooms = [...prev]
                    const roomIndex = updatedRooms.findIndex(room => room.id === activeChat.id)

                    if (roomIndex >= 0) {
                        updatedRooms[roomIndex] = {
                            ...updatedRooms[roomIndex],
                            lastMessage: newMessage,
                            unreadCount: sender.id !== user.id ?
                                updatedRooms[roomIndex].unreadCount + 1 :
                                updatedRooms[roomIndex].unreadCount
                        }

                        // Sắp xếp lại để phòng có tin nhắn mới nhất lên đầu
                        updatedRooms.sort((a, b) => {
                            const timeA = new Date(a.lastMessage?.timestamp || 0).getTime()
                            const timeB = new Date(b.lastMessage?.timestamp || 0).getTime()
                            return timeB - timeA
                        })
                    }

                    return updatedRooms
                })
            }
        }

        socketRef.current.onclose = () => {
            console.log('WebSocket connection closed')
            setIsConnected(false)
        }

        socketRef.current.onerror = (error) => {
            console.error('WebSocket error:', error)
            setIsConnected(false)
        }

        // Cleanup khi component unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.close()
            }
        }
    }, [user, activeChat, accessToken])

    // Gửi tin nhắn qua REST API
    const sendMessage = useCallback(async (receiverId: string, content: string): Promise<Message> => {
        if (!user || !accessToken) {
            throw new Error("Bạn cần đăng nhập để gửi tin nhắn")
        }

        try {
            // Gửi tin nhắn qua REST API
            const newMessage = await api.chat.sendMessage(receiverId, content)

            // Cập nhật danh sách tin nhắn nếu đang trong active chat
            if (activeChat && activeChat.partner.id === receiverId) {
                setMessages(prev => [...prev, newMessage])
            }

            // Gửi tin nhắn qua WebSocket nếu đã kết nối
            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({
                    message: content,
                    type: "chat_message"
                }))
            }

            // Cập nhật chatRooms với tin nhắn mới
            setChatRooms(prev => {
                const updatedRooms = [...prev]
                const roomId = `room_${user.id}_${receiverId}`
                const roomIndex = updatedRooms.findIndex(room => room.id === roomId)

                if (roomIndex >= 0) {
                    // Cập nhật phòng hiện có
                    updatedRooms[roomIndex] = {
                        ...updatedRooms[roomIndex],
                        lastMessage: newMessage
                    }
                } else {
                    // Tạo phòng mới nếu chưa có
                    const receiver = {
                        id: receiverId,
                        username: activeChat?.partner.username || "User",
                        email: "",
                        is_admin: false,
                        avatar: activeChat?.partner.avatar
                    }

                    updatedRooms.push({
                        id: roomId,
                        partner: receiver,
                        lastMessage: newMessage,
                        unreadCount: 0
                    })
                }

                // Sắp xếp lại để phòng có tin nhắn mới nhất lên đầu
                updatedRooms.sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.timestamp || 0).getTime()
                    const timeB = new Date(b.lastMessage?.timestamp || 0).getTime()
                    return timeB - timeA
                })

                return updatedRooms
            })

            return newMessage
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error)
            throw error
        }
    }, [user, accessToken, activeChat])

    // Chia sẻ bài hát
    const shareSong = useCallback(async (songId: string, receiverId: string, content: string): Promise<Message> => {
        if (!user || !accessToken) {
            throw new Error("Bạn cần đăng nhập để chia sẻ bài hát")
        }

        try {
            // Gửi yêu cầu chia sẻ bài hát qua REST API
            const newMessage = await api.chat.shareSong(songId, receiverId, content)

            // Cập nhật danh sách tin nhắn nếu đang trong active chat
            if (activeChat && activeChat.partner.id === receiverId) {
                setMessages(prev => [...prev, newMessage])
            }

            // Cập nhật chatRooms với tin nhắn mới
            setChatRooms(prev => {
                const updatedRooms = [...prev]
                const roomId = `room_${user.id}_${receiverId}`
                const roomIndex = updatedRooms.findIndex(room => room.id === roomId)

                if (roomIndex >= 0) {
                    // Cập nhật phòng hiện có
                    updatedRooms[roomIndex] = {
                        ...updatedRooms[roomIndex],
                        lastMessage: newMessage
                    }
                } else {
                    // Tạo phòng mới nếu chưa có
                    const receiver = {
                        id: receiverId,
                        username: activeChat?.partner.username || "User",
                        email: "",
                        is_admin: false,
                        avatar: activeChat?.partner.avatar
                    }

                    updatedRooms.push({
                        id: roomId,
                        partner: receiver,
                        lastMessage: newMessage,
                        unreadCount: 0
                    })
                }

                // Sắp xếp lại để phòng có tin nhắn mới nhất lên đầu
                updatedRooms.sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.timestamp || 0).getTime()
                    const timeB = new Date(b.lastMessage?.timestamp || 0).getTime()
                    return timeB - timeA
                })

                return updatedRooms
            })

            return newMessage
        } catch (error) {
            console.error("Lỗi khi chia sẻ bài hát:", error)
            throw error
        }
    }, [user, accessToken, activeChat])

    // Chia sẻ playlist
    const sharePlaylist = useCallback(async (playlistId: string, receiverId: string, content: string): Promise<Message> => {
        if (!user || !accessToken) {
            throw new Error("Bạn cần đăng nhập để chia sẻ playlist")
        }

        try {
            // Gửi yêu cầu chia sẻ playlist qua REST API
            const newMessage = await api.chat.sharePlaylist(playlistId, receiverId, content)

            // Cập nhật danh sách tin nhắn nếu đang trong active chat
            if (activeChat && activeChat.partner.id === receiverId) {
                setMessages(prev => [...prev, newMessage])
            }

            // Cập nhật chatRooms với tin nhắn mới
            setChatRooms(prev => {
                const updatedRooms = [...prev]
                const roomId = `room_${user.id}_${receiverId}`
                const roomIndex = updatedRooms.findIndex(room => room.id === roomId)

                if (roomIndex >= 0) {
                    // Cập nhật phòng hiện có
                    updatedRooms[roomIndex] = {
                        ...updatedRooms[roomIndex],
                        lastMessage: newMessage
                    }
                } else {
                    // Tạo phòng mới nếu chưa có
                    const receiver = {
                        id: receiverId,
                        username: activeChat?.partner.username || "User",
                        email: "",
                        is_admin: false,
                        avatar: activeChat?.partner.avatar
                    }

                    updatedRooms.push({
                        id: roomId,
                        partner: receiver,
                        lastMessage: newMessage,
                        unreadCount: 0
                    })
                }

                // Sắp xếp lại để phòng có tin nhắn mới nhất lên đầu
                updatedRooms.sort((a, b) => {
                    const timeA = new Date(a.lastMessage?.timestamp || 0).getTime()
                    const timeB = new Date(b.lastMessage?.timestamp || 0).getTime()
                    return timeB - timeA
                })

                return updatedRooms
            })

            return newMessage
        } catch (error) {
            console.error("Lỗi khi chia sẻ playlist:", error)
            throw error
        }
    }, [user, accessToken, activeChat])

    return (
        <ChatContext.Provider value={{
            activeChat,
            chatRooms,
            messages,
            isLoading,
            sendMessage,
            shareSong,
            sharePlaylist,
            setActiveChat,
            isConnected
        }}>
            {children}
        </ChatContext.Provider>
    )
}

export function useChat() {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error("useChat must be used within a ChatProvider")
    }
    return context
} 