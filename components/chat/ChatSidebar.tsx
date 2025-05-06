"use client"

import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { ChatRoom } from "@/types"

interface ChatSidebarProps {
    chatRooms: ChatRoom[]
    onSelectChat: (chat: ChatRoom) => void
    activeChat: ChatRoom | null
}

const ChatSidebar = ({ chatRooms, onSelectChat, activeChat }: ChatSidebarProps) => {
    const [searchTerm, setSearchTerm] = useState("")

    // Lọc chat rooms theo từ khóa tìm kiếm
    const filteredRooms = chatRooms.filter(room =>
        room.partner.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-muted-foreground/10">
                <h2 className="text-xl font-bold mb-4">Tin nhắn</h2>

                {/* Tìm kiếm */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm cuộc trò chuyện..."
                        className="w-full pl-10 pr-4 py-2 rounded-full bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Danh sách chat */}
            <div className="flex-1 overflow-y-auto">
                {filteredRooms.length > 0 ? (
                    <div className="divide-y divide-muted-foreground/10">
                        {filteredRooms.map((room) => (
                            <div
                                key={room.id}
                                className={`p-4 hover:bg-muted/50 cursor-pointer flex items-center space-x-3 transition-colors ${activeChat?.id === room.id ? 'bg-muted/80' : ''
                                    }`}
                                onClick={() => onSelectChat(room)}
                            >
                                {/* Avatar */}
                                <div className="relative h-12 w-12 rounded-full overflow-hidden">
                                    {room.partner.avatar ? (
                                        <Image
                                            src={room.partner.avatar}
                                            alt={room.partner.username}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-primary/20 flex items-center justify-center rounded-full">
                                            <span className="text-lg font-semibold">
                                                {room.partner.username.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Chi tiết tin nhắn */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold truncate">{room.partner.username}</h3>
                                        {room.lastMessage && (
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(room.lastMessage.timestamp).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-muted-foreground truncate">
                                            {room.lastMessage ? (
                                                room.lastMessage.message_type === 'TEXT' ?
                                                    room.lastMessage.content :
                                                    room.lastMessage.message_type === 'SONG' ?
                                                        '🎵 Đã chia sẻ một bài hát' :
                                                        room.lastMessage.message_type === 'PLAYLIST' ?
                                                            '🎧 Đã chia sẻ một playlist' :
                                                            'Tin nhắn media'
                                            ) : 'Bắt đầu trò chuyện'}
                                        </p>

                                        {room.unreadCount > 0 && (
                                            <span className="inline-flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full h-5 min-w-5 px-1.5">
                                                {room.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <p className="text-muted-foreground">
                            {searchTerm ?
                                'Không tìm thấy cuộc trò chuyện nào' :
                                'Chưa có cuộc trò chuyện nào'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChatSidebar 