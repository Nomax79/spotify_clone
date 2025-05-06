"use client"

import Image from "next/image"
import { Message } from "@/types"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { PlayIcon } from "lucide-react"

interface MessageItemProps {
    message: Message
    isCurrentUser: boolean
}

const MessageItem = ({ message, isCurrentUser }: MessageItemProps) => {
    const formattedTime = formatDistanceToNow(new Date(message.timestamp), {
        addSuffix: true,
        locale: vi
    })

    // Render các loại tin nhắn khác nhau
    const renderMessageContent = () => {
        switch (message.message_type) {
            case 'TEXT':
                return <p>{message.content}</p>

            case 'SONG':
                if (!message.shared_song) return <p>{message.content}</p>
                return (
                    <div className="mt-2">
                        <p className="mb-2">{message.content}</p>
                        <div className="bg-background/80 rounded-lg p-3 flex items-center space-x-3 border border-muted-foreground/20">
                            {message.shared_song.cover_image && (
                                <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                        src={message.shared_song.cover_image}
                                        alt={message.shared_song.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{message.shared_song.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">{message.shared_song.artist}</p>
                            </div>
                            <button
                                className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0"
                            >
                                <PlayIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )

            case 'PLAYLIST':
                if (!message.shared_playlist) return <p>{message.content}</p>
                return (
                    <div className="mt-2">
                        <p className="mb-2">{message.content}</p>
                        <div className="bg-background/80 rounded-lg p-3 flex items-center space-x-3 border border-muted-foreground/20">
                            {message.shared_playlist.cover_image && (
                                <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                        src={message.shared_playlist.cover_image}
                                        alt={message.shared_playlist.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{message.shared_playlist.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                    {message.shared_playlist.song_count || 0} bài hát
                                </p>
                            </div>
                            <button
                                className="bg-primary text-primary-foreground rounded-full p-2 flex-shrink-0"
                            >
                                <PlayIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )

            case 'IMAGE':
                if (!message.image) return <p>{message.content}</p>
                return (
                    <div className="mt-2">
                        {message.content && <p className="mb-2">{message.content}</p>}
                        <div className="relative h-48 w-full rounded-lg overflow-hidden">
                            <Image
                                src={message.image}
                                alt="Shared image"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )

            default:
                return <p>{message.content}</p>
        }
    }

    return (
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar (chỉ hiển thị cho tin nhắn người khác) */}
                {!isCurrentUser && (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2 mt-1 flex-shrink-0">
                        {message.sender.avatar ? (
                            <Image
                                src={message.sender.avatar}
                                alt={message.sender.username}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-primary/20 flex items-center justify-center rounded-full">
                                <span className="text-xs font-semibold">
                                    {message.sender.username.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Nội dung tin nhắn */}
                <div>
                    <div
                        className={`py-2 px-3 rounded-2xl ${isCurrentUser
                                ? 'bg-primary text-primary-foreground rounded-tr-none mr-2'
                                : 'bg-muted rounded-tl-none ml-0'
                            }`}
                    >
                        {renderMessageContent()}
                    </div>
                    <div className={`text-xs text-muted-foreground mt-1 ${isCurrentUser ? 'text-right mr-2' : 'text-left'}`}>
                        {formattedTime}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MessageItem 