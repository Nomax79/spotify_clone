"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Search, Send, Paperclip, Mic, MoreVertical, Play, Music, ImageIcon, X, ChevronLeft } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { chatApi, accountsApi } from "@/lib/api"
import type { Conversation, Message, PublicUser, Song, User } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMobile } from "@/hooks/use-mobile"
import { MessageTypeEnum } from "@/types"

export default function MessengerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PublicUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showShareMusic, setShowShareMusic] = useState(false)
  const [recentSongs, setRecentSongs] = useState<Song[]>([])
  const [showMobileConversations, setShowMobileConversations] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/messenger")
    }
  }, [user, router])

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return

      try {
        setIsLoading(true)
        const conversationsData = (await chatApi.getConversations()) as Conversation[]
        setConversations(
          conversationsData.length > 0 ? conversationsData : (mockConversations as unknown as Conversation[]),
        )

        // Select the first conversation by default
        if (conversationsData.length > 0 && !selectedConversation) {
          setSelectedConversation(conversationsData[0])
          setShowMobileConversations(false)
        } else if (mockConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(mockConversations[0] as unknown as Conversation)
          setShowMobileConversations(false)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
        setConversations(mockConversations as unknown as Conversation[])

        if (mockConversations.length > 0 && !selectedConversation) {
          setSelectedConversation(mockConversations[0] as unknown as Conversation)
          setShowMobileConversations(false)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversations()
  }, [user])

  // Fetch messages for selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation) return

      try {
        // In a real app, you would fetch messages for the specific conversation
        const messagesData = (await chatApi.getMessages()) as Message[]

        // Filter messages for the selected conversation
        // This is a simplification - in a real app, the API would return only relevant messages
        const filteredMessages = messagesData.filter(
          (msg: Message) =>
            (msg.sender === user?.id && msg.receiver === selectedConversation.participants[0].id) ||
            (msg.sender === selectedConversation.participants[0].id && msg.receiver === user?.id),
        )

        setMessages(filteredMessages.length > 0 ? filteredMessages : (mockMessages as unknown as Message[]))
      } catch (error) {
        console.error("Error fetching messages:", error)
        setMessages(mockMessages as unknown as Message[])
      }
    }

    fetchMessages()
  }, [selectedConversation, user])

  // Handle search
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      try {
        // In a real app, you would call an API to search users
        const users = await accountsApi.getPublicUsers()
        const filtered: PublicUser[] = users.filter((user: PublicUser) => 
          user.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(
          filtered.length > 0
            ? filtered
            : mockContacts.filter((contact) => contact.username.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      } catch (error) {
        console.error("Error searching users:", error)
        setSearchResults(
          mockContacts.filter((contact) => contact.username.toLowerCase().includes(searchQuery.toLowerCase())),
        )
      }
    }

    if (searchQuery) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Mock data for UI display when API data is not available
  const mockConversations = [
    {
      id: "1",
      participants: [
        {
          id: "2",
          username: "johndoe",
          profile_image: "/placeholder.svg?height=40&width=40&text=JD",
        },
      ],
      last_message: {
        id: "101",
        sender: "2",
        receiver: user?.id || "1",
        content: "Bạn đã nghe bài hát mới của Sơn Tùng chưa?",
        type: "text",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: true,
      },
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "2",
      participants: [
        {
          id: "3",
          username: "janedoe",
          profile_image: "/placeholder.svg?height=40&width=40&text=JD",
        },
      ],
      last_message: {
        id: "102",
        sender: user?.id || "1",
        receiver: "3",
        content: "Tôi vừa tạo một playlist mới, bạn có muốn xem không?",
        type: "text",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_read: true,
      },
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      participants: [
        {
          id: "4",
          username: "bobsmith",
          profile_image: "/placeholder.svg?height=40&width=40&text=BS",
        },
      ],
      last_message: {
        id: "103",
        sender: "4",
        receiver: user?.id || "1",
        content: "Bài hát này hay quá!",
        type: "text",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        is_read: false,
      },
      created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ]

  const mockMessages = [
    {
      id: "1001",
      sender: user?.id || "1",
      receiver: "2",
      content: "Chào bạn!",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      is_read: true,
    },
    {
      id: "1002",
      sender: "2",
      receiver: user?.id || "1",
      content: "Chào bạn! Bạn khỏe không?",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 1.9).toISOString(),
      is_read: true,
    },
    {
      id: "1003",
      sender: user?.id || "1",
      receiver: "2",
      content: "Tôi khỏe, cảm ơn bạn. Bạn đã nghe bài hát mới của Sơn Tùng chưa?",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 1.8).toISOString(),
      is_read: true,
    },
    {
      id: "1004",
      sender: "2",
      receiver: user?.id || "1",
      content: "Chưa, bài nào vậy?",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 1.7).toISOString(),
      is_read: true,
    },
    {
      id: "1005",
      sender: user?.id || "1",
      receiver: "2",
      content: "",
      type: MessageTypeEnum.AUDIO,
      created_at: new Date(Date.now() - 3600000 * 1.6).toISOString(),
      is_read: true,
      shared_song: {
        id: "s1",
        title: "Chúng Ta Của Hiện Tại",
        artist: "Sơn Tùng M-TP",
        cover_image: "/placeholder.svg?height=60&width=60",
        duration: 240,
        file_path: "/path/to/song.mp3",
        created_at: new Date().toISOString(),
      },
    },
    {
      id: "1006",
      sender: "2",
      receiver: user?.id || "1",
      content: "Bài hát này hay quá! Cảm ơn bạn đã chia sẻ.",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      is_read: true,
    },
    {
      id: "1007",
      sender: user?.id || "1",
      receiver: "2",
      content: "Không có gì. Tôi đang nghe bài này suốt ngày luôn.",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000 * 1.4).toISOString(),
      is_read: true,
    },
    {
      id: "1008",
      sender: "2",
      receiver: user?.id || "1",
      content: "Bạn đã nghe bài hát mới của Sơn Tùng chưa?",
      type: MessageTypeEnum.TEXT,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      is_read: true,
    },
  ]

  const mockContacts = [
    {
      id: "2",
      username: "johndoe",
      profile_image: "/placeholder.svg?height=40&width=40&text=JD",
    },
    {
      id: "3",
      username: "janedoe",
      profile_image: "/placeholder.svg?height=40&width=40&text=JD",
    },
    {
      id: "4",
      username: "bobsmith",
      profile_image: "/placeholder.svg?height=40&width=40&text=BS",
    },
    {
      id: "5",
      username: "alicejones",
      profile_image: "/placeholder.svg?height=40&width=40&text=AJ",
    },
  ]

  const mockRecentSongs = [
    {
      id: "s1",
      title: "Chúng Ta Của Hiện Tại",
      artist: "Sơn Tùng M-TP",
      cover_image: "/placeholder.svg?height=60&width=60",
      duration: 240,
      file_path: "/path/to/song.mp3",
      created_at: new Date().toISOString(),
    },
    {
      id: "s2",
      title: "Ngày Mai Em Đi",
      artist: "Lê Hiếu, SOOBIN, Touliver",
      cover_image: "/placeholder.svg?height=60&width=60",
      duration: 230,
      file_path: "/path/to/song2.mp3",
      created_at: new Date().toISOString(),
    },
    {
      id: "s3",
      title: "vạn vật như muốn ta bên nhau",
      artist: "RIO",
      cover_image: "/placeholder.svg?height=60&width=60",
      duration: 220,
      file_path: "/path/to/song3.mp3",
      created_at: new Date().toISOString(),
    },
    {
      id: "s4",
      title: "ADAMN",
      artist: "Bình Gold",
      cover_image: "/placeholder.svg?height=60&width=60",
      duration: 210,
      file_path: "/path/to/song4.mp3",
      created_at: new Date().toISOString(),
    },
  ]

  const displayConversations = conversations.length > 0 ? conversations : mockConversations
  const displayMessages = messages.length > 0 ? messages : mockMessages
  const displayRecentSongs = recentSongs.length > 0 ? recentSongs : mockRecentSongs

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const messageData = {
        receiver: selectedConversation.participants[0].id,
        content: newMessage,
        type: "text" as MessageTypeEnum.TEXT,
      }

      // In a real app, you would send the message to the API
      const sentMessage = (await chatApi.createMessage(messageData)) as Message

      // Update the messages list
      setMessages([...displayMessages, sentMessage])

      // Clear the input
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)

      // Fallback for demo
      const mockSentMessage: Message = {
        id: `new-${Date.now()}`,
        sender: user?.id || "1",
        receiver: selectedConversation.participants[0].id,
        content: newMessage,
        type: MessageTypeEnum.TEXT,
        created_at: new Date().toISOString(),
        is_read: false,
      }

      setMessages([...displayMessages, mockSentMessage])
      setNewMessage("")
    }
  }

  const handleShareSong = async (song: Song) => {
    if (!selectedConversation) return

    try {
      const messageData = {
        receiver: selectedConversation.participants[0].id,
        content: "",
        type: MessageTypeEnum.AUDIO,
        shared_song: song.id,
      }

      // In a real app, you would send the message to the API
      const sentMessage = (await chatApi.createMessage(messageData)) as any

      // Update the messages list
      setMessages([
        ...displayMessages,
        {
          ...sentMessage,
          shared_song: song,
        } as Message,
      ])

      // Hide the share music panel
      setShowShareMusic(false)
    } catch (error) {
      console.error("Error sharing song:", error)

      // Fallback for demo
      const mockSentMessage: Message = {
        id: `new-${Date.now()}`,
        sender: user?.id || "1",
        receiver: selectedConversation.participants[0].id,
        content: "",
        type: MessageTypeEnum.AUDIO,
        created_at: new Date().toISOString(),
        is_read: false,
        shared_song: song as Song,
      }

      setMessages([...displayMessages, mockSentMessage])
      setShowShareMusic(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Hôm qua"
    } else {
      return date.toLocaleDateString()
    }
  }

  const selectConversation = (conversation: Conversation | any) => {
    setSelectedConversation(conversation as Conversation)
    if (isMobile) {
      setShowMobileConversations(false)
    }
  }

  const startNewConversation = (contact: PublicUser) => {
    // Check if conversation already exists
    const existingConv = displayConversations.find((conv) => conv.participants[0].id === contact.id)

    if (existingConv) {
      selectConversation(existingConv)
    } else {
      // Create a new conversation
      const newConv = {
        id: `new-${contact.id}`,
        participants: [contact as unknown as User],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Conversation

      selectConversation(newConv)
    }

    setSearchQuery("")
  }

  if (!user) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar - Conversations list */}
      <div 
        className={`${
          isMobile
            ? `fixed inset-0 z-20 ${showMobileConversations ? "block" : "hidden"}`
            : "w-80 border-r border-white/10"
        } bg-zinc-900 flex flex-col `}
      >
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold mb-4">Tin nhắn</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm người dùng"
              className="pl-9 bg-zinc-800 border-none h-10 text-white focus-visible:ring-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {/* Search results */}
          {searchQuery && searchResults.length > 0 && (
            <div className="p-2">
              <div className="text-xs text-white/50 uppercase px-3 py-2">Kết quả tìm kiếm</div>
              {searchResults.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors"
                  onClick={() => startNewConversation(contact)}
                >
                  <Image
                    src={contact.profile_image || "/placeholder.svg?height=48&width=48"}
                    width={48}
                    height={48}
                    alt={contact.username}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate">{contact.username}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No search results */}
          {searchQuery && searchResults.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-white/50">Không tìm thấy người dùng nào</p>
            </div>
          )}

          {/* Conversations list */}
          {!searchQuery && (
            <div className="p-2">
              <div className="text-xs text-white/50 uppercase px-3 py-2">Tin nhắn gần đây</div>
              {displayConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id ? "bg-zinc-800" : "hover:bg-zinc-800/50"
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <Image
                    src={conversation.participants[0].profile_image || "/placeholder.svg?height=48&width=48"}
                    width={48}
                    height={48}
                    alt={conversation.participants[0].username}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{conversation.participants[0].username}</span>
                      {conversation.last_message && (
                        <span className="text-xs text-white/50">
                          {formatTime(conversation.last_message?.created_at || conversation.updated_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/70 truncate">
                        {conversation.last_message?.type === "music"
                          ? "Đã chia sẻ một bài hát"
                          : conversation.last_message?.content}
                      </span>
                      {!conversation.last_message?.is_read && conversation.last_message?.sender !== user.id && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      <div
        className={`${
          isMobile ? `fixed inset-0 z-10 ${!showMobileConversations ? "block" : "hidden"}` : "flex-1"
        } flex flex-col bg-black`}
      >
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowMobileConversations(true)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                )}
                <Image
                  src={selectedConversation.participants[0].profile_image || "/placeholder.svg?height=40&width=40"}
                  width={40}
                  height={40}
                  alt={selectedConversation.participants[0].username}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{selectedConversation.participants[0].username}</div>
                  <div className="text-xs text-white/50">Hoạt động gần đây</div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                  <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                    Xem hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                    Chặn người dùng
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700 text-red-500">
                    Xóa cuộc trò chuyện
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {displayMessages.map((message, index) => {
                const isCurrentUser = message.sender === user.id
                const showDate =
                  index === 0 || formatDate(message.created_at) !== formatDate(displayMessages[index - 1].created_at)

                return (
                  <div key={message.id}>
                    {showDate && (
                      <div className="text-center my-4">
                        <span className="text-xs bg-zinc-800 text-white/50 px-2 py-1 rounded-full">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    )}

                    <div className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      {!isCurrentUser && (
                        <Image
                          src={
                            selectedConversation.participants[0].profile_image || "/placeholder.svg?height=32&width=32"
                          }
                          width={32}
                          height={32}
                          alt={selectedConversation.participants[0].username}
                          className="rounded-full mr-2 self-end"
                        />
                      )}

                      <div className={`max-w-[70%] ${isCurrentUser ? "bg-green-600" : "bg-zinc-700"} rounded-2xl p-3`}>
                        {message.type === MessageTypeEnum.TEXT ? (
                          <p>{message.content}</p>
                        ) : message.type === MessageTypeEnum.AUDIO && message.shared_song ? (
                          <div className="bg-zinc-800 rounded-lg p-2 flex items-center gap-3">
                            <Image
                              src={message.shared_song.cover_image || "/placeholder.svg?height=60&width=60"}
                              width={60}
                              height={60}
                              alt={message.shared_song.title}
                              className="rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{message.shared_song.title}</div>
                              <div className="text-sm text-white/70 truncate">{message.shared_song.artist}</div>
                            </div>
                            <Button size="icon" className="rounded-full bg-green-500 text-black h-8 w-8">
                              <Play className="h-4 w-4 ml-0.5" />
                            </Button>
                          </div>
                        ) : null}
                        <div className="text-right mt-1">
                          <span className="text-xs text-white/50">{formatTime(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Share music panel */}
            {showShareMusic && (
              <div className="p-4 border-t border-white/10 bg-zinc-900">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">Chia sẻ bài hát</h3>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowShareMusic(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {displayRecentSongs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-zinc-800 rounded-lg p-3 cursor-pointer hover:bg-zinc-700 transition-colors"
                      onClick={() => handleShareSong(song)}
                    >
                      <div className="relative mb-2">
                        <Image
                          src={song.cover_image || "/placeholder.svg?height=120&width=120"}
                          width={120}
                          height={120}
                          alt={song.title}
                          className="rounded w-full"
                        />
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black h-8 w-8"
                        >
                          <Play className="h-4 w-4 ml-0.5" />
                        </Button>
                      </div>
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-white/70 truncate">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message input */}
            <div className="p-4 border-t border-white/10 flex items-center gap-2 bg-zinc-900">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={() => setShowShareMusic(!showShareMusic)}
              >
                <Music className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Nhập tin nhắn..."
                className="flex-1 bg-zinc-800 border-none text-white focus-visible:ring-0"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button variant="ghost" size="icon" className="rounded-full">
                <Mic className="h-5 w-5" />
              </Button>
              <Button
                className="rounded-full bg-green-500 hover:bg-green-600 text-black"
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
            <Music className="h-16 w-16 text-white/30 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Chia sẻ âm nhạc với bạn bè</h2>
            <p className="text-white/70 max-w-md mb-6">
              Chọn một cuộc trò chuyện để bắt đầu chia sẻ âm nhạc và trò chuyện với bạn bè của bạn.
            </p>
            {isMobile && (
              <Button
                className="bg-green-500 hover:bg-green-600 text-black"
                onClick={() => setShowMobileConversations(true)}
              >
                Xem danh sách trò chuyện
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
