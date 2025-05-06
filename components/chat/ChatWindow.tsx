"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, Send, Mic, PaperclipIcon, SmileIcon } from "lucide-react"
import { useChat } from "@/context/chat-context"
import { useAuth } from "@/context/auth-context"
import MessageItem from "./MessageItem"

interface ChatWindowProps {
    onToggleSidebar: () => void
    isMobileSidebarOpen: boolean
}

const ChatWindow = ({ onToggleSidebar, isMobileSidebarOpen }: ChatWindowProps) => {
    const { activeChat, messages, sendMessage, isConnected } = useChat()
    const { user } = useAuth()
    const [messageText, setMessageText] = useState("")
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Tự động scroll xuống tin nhắn mới nhất
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages])

    // Hàm gửi tin nhắn
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (!messageText.trim() || !activeChat || isSending) return

        try {
            setIsSending(true)
            await sendMessage(activeChat.partner.id, messageText)
            setMessageText("")
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error)
        } finally {
            setIsSending(false)
        }
    }

    // Xử lý nhấn Enter để gửi tin nhắn
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (!activeChat) return null

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-muted-foreground/10 flex items-center">
                <button
                    className="md:hidden p-2 -ml-2 mr-2 rounded-full hover:bg-muted/80"
                    onClick={onToggleSidebar}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center space-x-3">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        {activeChat.partner.avatar ? (
                            <Image
                                src={activeChat.partner.avatar}
                                alt={activeChat.partner.username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-primary/20 flex items-center justify-center rounded-full">
                                <span className="text-lg font-semibold">
                                    {activeChat.partner.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">{activeChat.partner.username}</h3>
                        <p className="text-xs text-muted-foreground">
                            {isConnected ? 'Đang hoạt động' : 'Ngoại tuyến'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageItem
                            key={message.id}
                            message={message}
                            isCurrentUser={message.sender.id === user?.id}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <p className="text-muted-foreground mb-2">
                            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
                        </p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-muted-foreground/10">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                    <div className="flex-1 relative">
                        <div className="absolute bottom-2 left-3 flex space-x-1">
                            <button
                                type="button"
                                className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <PaperclipIcon className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <SmileIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập tin nhắn..."
                            className="w-full rounded-2xl bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary pl-[4.5rem] pr-4 py-3 max-h-32 min-h-[52px]"
                            rows={1}
                        ></textarea>

                        <button
                            type="button"
                            className="absolute bottom-2 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                    </div>

                    <button
                        type="submit"
                        className={`p-3 rounded-full bg-primary text-primary-foreground flex items-center justify-center ${!messageText.trim() || isSending ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={!messageText.trim() || isSending}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatWindow 