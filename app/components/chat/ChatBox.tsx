"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface ChatBoxProps {
    recipientUsername: string
}

export default function ChatBox({ recipientUsername }: ChatBoxProps) {
    const [message, setMessage] = useState("")
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

    const {
        messages,
        sendMessage,
        setTyping,
        typingUsers,
        isConnected,
        isLoading
    } = useChat()

    const { user } = useAuth()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Cuộn xuống cuối danh sách tin nhắn khi có tin nhắn mới
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Kiểm tra trạng thái đang nhập và gửi sự kiện tương ứng
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value)

        // Xóa timeout cũ nếu có
        if (typingTimeout) {
            clearTimeout(typingTimeout)
        }

        // Gửi trạng thái đang nhập
        setTyping(true, recipientUsername)

        // Đặt timeout để gửi trạng thái dừng nhập sau 2 giây không hoạt động
        const timeout = setTimeout(() => {
            setTyping(false, recipientUsername)
        }, 2000)

        setTypingTimeout(timeout)
    }

    // Gửi tin nhắn
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim()) return

        if (sendMessage(message, recipientUsername)) {
            setMessage("")
            // Gửi trạng thái dừng nhập sau khi gửi tin nhắn
            setTyping(false, recipientUsername)
        }
    }

    // Format thời gian
    const formatTime = (timestamp: string) => {
        if (!timestamp) return ""
        try {
            return formatDistanceToNow(new Date(timestamp), {
                addSuffix: true,
                locale: vi
            })
        } catch (error) {
            return ""
        }
    }

    // Kiểm tra xem người dùng có đang nhập không
    const isRecipientTyping = typingUsers.some(
        (user) => user.username === recipientUsername && user.is_typing
    )

    return (
        <div className="flex flex-col h-full">
            {/* Phần đầu */}
            <div className="p-4 border-b border-neutral-700 flex items-center">
                <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-white font-bold">
                    {recipientUsername.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                    <h2 className="font-medium">{recipientUsername}</h2>
                    <div className="text-xs text-neutral-400">
                        {isConnected ? "Đang kết nối" : "Đang kết nối lại..."}
                    </div>
                </div>
            </div>

            {/* Phần tin nhắn */}
            <div className="flex-1 p-4 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin h-8 w-8 border-t-2 border-white rounded-full"></div>
                    </div>
                ) : messages.length > 0 ? (
                    <div className="space-y-4">
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.username === user?.username || msg.username === user?.email
                            return (
                                <div
                                    key={`${msg.username}-${index}-${msg.timestamp || Date.now()}`}
                                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
                                                ? "bg-green-600 text-white rounded-tr-none"
                                                : "bg-neutral-700 text-white rounded-tl-none"
                                            }`}
                                    >
                                        <div className="break-words">{msg.message}</div>
                                        <div className="text-xs opacity-70 mt-1 text-right">
                                            {msg.timestamp ? formatTime(msg.timestamp) : "Vừa gửi"}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-neutral-400">
                        Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                    </div>
                )}

                {/* Chỉ báo đang nhập */}
                {isRecipientTyping && (
                    <div className="flex items-center mt-2 text-neutral-400 text-sm">
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                            <div className="w-2 h-2 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: "600ms" }}></div>
                        </div>
                        <span className="ml-2">{recipientUsername} đang nhập...</span>
                    </div>
                )}
            </div>

            {/* Phần input */}
            <div className="p-4 border-t border-neutral-700">
                <form onSubmit={handleSendMessage} className="flex items-center">
                    <input
                        type="text"
                        value={message}
                        onChange={handleInputChange}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 bg-neutral-800 rounded-l-md border border-neutral-700 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={!isConnected}
                    />
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-r-md px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isConnected || !message.trim()}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
} 