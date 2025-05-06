"use client"

import { useState } from "react"
import { useChat } from "@/context/chat-context"
import ChatSidebar from "./ChatSidebar"
import ChatWindow from "./ChatWindow"
import EmptyState from "./EmptyState"

const ChatLayout = () => {
    const { activeChat, chatRooms, setActiveChat } = useChat()
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    return (
        <div className="flex h-full overflow-hidden">
            {/* Sidebar - Hiển thị danh sách cuộc trò chuyện */}
            <div
                className={`bg-background border-r border-muted-foreground/10 transition-all duration-300 
          ${isMobileSidebarOpen ? 'w-full absolute z-10 md:relative md:w-80' : 'w-0 md:w-80'}`}
            >
                <ChatSidebar
                    chatRooms={chatRooms}
                    onSelectChat={(chat) => {
                        setActiveChat(chat)
                        setIsMobileSidebarOpen(false)
                    }}
                    activeChat={activeChat}
                />
            </div>

            {/* Khu vực trò chuyện chính */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {activeChat ? (
                    <ChatWindow
                        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                        isMobileSidebarOpen={isMobileSidebarOpen}
                    />
                ) : (
                    <EmptyState onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
                )}
            </div>
        </div>
    )
}

export default ChatLayout 