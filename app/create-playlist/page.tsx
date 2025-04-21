"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ChevronLeft, ChevronRight, ImageIcon, Music, Search, Plus, Save, Trash2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { musicApi } from "@/lib/api"
import type { Song } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CreatePlaylistPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [title, setTitle] = useState("Playlist mới")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Search for songs
  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      setIsLoading(true)
      const results = await musicApi.searchSongs(searchQuery)
      setSearchResults(results.length > 0 ? results : mockSongs)
    } catch (error) {
      console.error("Error searching songs:", error)
      setSearchResults(mockSongs)
    } finally {
      setIsLoading(false)
    }
  }

  // Add song to playlist
  const addSong = (song: Song) => {
    if (!selectedSongs.some((s) => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song])
    }
  }

  // Remove song from playlist
  const removeSong = (songId: string) => {
    setSelectedSongs(selectedSongs.filter((song) => song.id !== songId))
  }

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file)
      setCoverImage(imageUrl)
    }
  }

  // Save playlist
  const savePlaylist = async () => {
    if (!title.trim()) {
      alert("Vui lòng nhập tên danh sách phát")
      return
    }

    try {
      setIsSaving(true)

      // Create playlist data
      const playlistData = {
        title,
        description,
        is_public: isPublic,
        // In a real app, you would upload the cover image and get a URL
        cover_image: coverImage || undefined,
      }

      // Create the playlist
      const playlist = await musicApi.createPlaylist(playlistData)

      // Add songs to the playlist
      for (const song of selectedSongs) {
        await musicApi.addSongToPlaylist(playlist.id, song.id)
      }

      // Redirect to the new playlist
      router.push(`/playlist/${playlist.id}`)
    } catch (error) {
      console.error("Error saving playlist:", error)
      alert("Có lỗi xảy ra khi lưu danh sách phát. Vui lòng thử lại sau.")
    } finally {
      setIsSaving(false)
    }
  }

  // Mock data for UI display when API data is not available
  const mockSongs = [
    {
      id: "s1",
      title: "Chúng Ta Của Hiện Tại",
      artist: "Sơn Tùng M-TP",
      album: "Chúng Ta Của Hiện Tại (Single)",
      duration: 289,
      cover_image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "s2",
      title: "Có Chắc Yêu Là Đây",
      artist: "Sơn Tùng M-TP",
      album: "Có Chắc Yêu Là Đây (Single)",
      duration: 218,
      cover_image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "s3",
      title: "Chạy Ngay Đi",
      artist: "Sơn Tùng M-TP",
      album: "Chạy Ngay Đi (Single)",
      duration: 248,
      cover_image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "s4",
      title: "Lạc Trôi",
      artist: "Sơn Tùng M-TP",
      album: "Lạc Trôi (Single)",
      duration: 253,
      cover_image: "/placeholder.svg?height=60&width=60",
    },
    {
      id: "s5",
      title: "Nơi Này Có Anh",
      artist: "Sơn Tùng M-TP",
      album: "Nơi Này Có Anh (Single)",
      duration: 267,
      cover_image: "/placeholder.svg?height=60&width=60",
    },
  ]

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  if (!user) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 text-white"
            onClick={() => router.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-black/20 text-white"
            onClick={() => router.forward()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-8">Tạo danh sách phát mới</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Playlist details */}
          <div className="md:col-span-1">
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <div className="mb-6">
                <div
                  className="relative w-full aspect-square bg-zinc-700 rounded-lg mb-4 flex items-center justify-center cursor-pointer overflow-hidden"
                  onClick={() => document.getElementById("cover-image-upload")?.click()}
                >
                  {coverImage ? (
                    <Image src={coverImage || "/placeholder.svg"} fill alt="Playlist cover" className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="h-12 w-12 text-white/50 mb-2" />
                      <span className="text-white/70 text-sm">Chọn ảnh bìa</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  id="cover-image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-white/70 mb-1 block">
                    Tên danh sách phát
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-zinc-700 border-none text-white focus-visible:ring-green-500"
                    placeholder="Tên danh sách phát"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-white/70 mb-1 block">
                    Mô tả
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-zinc-700 border-none text-white focus-visible:ring-green-500 min-h-[100px]"
                    placeholder="Thêm mô tả tùy chọn"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is-public" className="text-white/70">
                    Công khai
                  </Label>
                  <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600 text-black"
                    onClick={savePlaylist}
                    disabled={isSaving || selectedSongs.length === 0}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu danh sách phát"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Song search and selection */}
          <div className="md:col-span-2">
            <div className="bg-zinc-800/50 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Thêm bài hát</h2>

              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input
                  placeholder="Tìm kiếm bài hát"
                  className="pl-10 bg-zinc-700 border-none h-12 text-white focus-visible:ring-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-black"
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                >
                  Tìm kiếm
                </Button>
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-2">Kết quả tìm kiếm</h3>
                  <ScrollArea className="h-[300px] rounded-md border border-white/10">
                    <div className="space-y-1 p-2">
                      {searchResults.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-zinc-700/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <Image
                              src={song.cover_image || "/placeholder.svg"}
                              width={40}
                              height={40}
                              alt={song.title}
                              className="rounded"
                            />
                            <div>
                              <div className="font-medium">{song.title}</div>
                              <div className="text-sm text-white/70">{song.artist}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white/70">{formatDuration(song.duration)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full opacity-0 group-hover:opacity-100"
                              onClick={() => addSong(song)}
                              disabled={selectedSongs.some((s) => s.id === song.id)}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Selected songs */}
              <div>
                <h3 className="text-lg font-medium mb-2">Bài hát đã chọn ({selectedSongs.length})</h3>
                {selectedSongs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Music className="h-12 w-12 text-white/30 mb-2" />
                    <p className="text-white/70">Chưa có bài hát nào được thêm vào danh sách phát</p>
                    <p className="text-white/50 text-sm">Tìm kiếm và thêm bài hát để bắt đầu</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] rounded-md border border-white/10">
                    <div className="space-y-1 p-2">
                      {selectedSongs.map((song, index) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between gap-4 p-2 rounded-md hover:bg-zinc-700/50 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 text-center text-white/70">{index + 1}</div>
                            <Image
                              src={song.cover_image || "/placeholder.svg"}
                              width={40}
                              height={40}
                              alt={song.title}
                              className="rounded"
                            />
                            <div>
                              <div className="font-medium">{song.title}</div>
                              <div className="text-sm text-white/70">{song.artist}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-white/70">{formatDuration(song.duration)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full text-red-500 opacity-0 group-hover:opacity-100"
                              onClick={() => removeSong(song.id)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
