"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Search, ChevronLeft, ChevronRight, Play, Grid, List, Filter, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { musicApi } from "@/lib/api"
import type { Playlist, Album, Song } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function LibraryPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [view, setView] = useState<"grid" | "list">("grid")
  const [filter, setFilter] = useState<"all" | "playlists" | "albums" | "artists" | "songs">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [likedSongs, setLikedSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Fetch library data
  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!user) return

      try {
        setLoading(true)

        // In a real app, you would have an API endpoint for the user's library
        // For now, we'll fetch playlists and albums

        const [playlistsData, albumsData, songsData] = await Promise.all([
          musicApi.getPlaylists(),
          musicApi.getAlbums(),
          musicApi.getSongs(),
        ])

        setPlaylists(playlistsData.length > 0 ? playlistsData : mockPlaylists)
        setAlbums(albumsData.length > 0 ? albumsData : mockAlbums)

        // For liked songs, we would need an API endpoint
        // For now, we'll use mock data
        setLikedSongs(mockLikedSongs)
      } catch (error) {
        console.error("Error fetching library data:", error)

        // Use mock data if API fails
        setPlaylists(mockPlaylists)
        setAlbums(mockAlbums)
        setLikedSongs(mockLikedSongs)
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [user])

  // Filter items based on search query and filter type
  const filteredItems = () => {
    let items: Array<{ id: string; type: string; title: string; subtitle: string; image: string; date?: string }> = []

    // Add playlists
    if (filter === "all" || filter === "playlists") {
      items = [
        ...items,
        ...playlists.map((playlist) => ({
          id: playlist.id,
          type: "playlist",
          title: playlist.title,
          subtitle: `Danh sách phát • ${playlist.created_by || user?.username}`,
          image: playlist.cover_image || "/placeholder.svg?height=200&width=200",
          date: playlist.created_at,
        })),
      ]
    }

    // Add albums
    if (filter === "all" || filter === "albums") {
      items = [
        ...items,
        ...albums.map((album) => ({
          id: album.id,
          type: "album",
          title: album.title,
          subtitle: `Album • ${album.artist}`,
          image: album.cover_image || "/placeholder.svg?height=200&width=200",
          date: album.release_date,
        })),
      ]
    }

    // Add liked songs (as a special item)
    if ((filter === "all" || filter === "playlists") && likedSongs.length > 0) {
      items.unshift({
        id: "liked-songs",
        type: "liked-songs",
        title: "Bài hát đã thích",
        subtitle: `Danh sách phát • ${likedSongs.length} bài hát`,
        image: "/placeholder.svg?height=200&width=200&text=♥",
      })
    }

    // Filter by search query
    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return items
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Mock data for UI display when API data is not available
  const mockPlaylists = [
    {
      id: "p1",
      title: "My Playlist #1",
      created_by: user?.username,
      cover_image: "/placeholder.svg?height=200&width=200&text=P1",
      created_at: new Date().toISOString(),
      is_public: true,
    },
    {
      id: "p2",
      title: "Chill Vibes",
      created_by: user?.username,
      cover_image: "/placeholder.svg?height=200&width=200&text=CV",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      is_public: true,
    },
    {
      id: "p3",
      title: "Workout Mix",
      created_by: user?.username,
      cover_image: "/placeholder.svg?height=200&width=200&text=WM",
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
      is_public: false,
    },
  ]

  const mockAlbums = [
    {
      id: "a1",
      title: "Chúng Ta Của Hiện Tại",
      artist: "Sơn Tùng M-TP",
      release_date: "2020-12-20",
      cover_image: "/placeholder.svg?height=200&width=200&text=CTCHT",
    },
    {
      id: "a2",
      title: "Có Chắc Yêu Là Đây",
      artist: "Sơn Tùng M-TP",
      release_date: "2020-07-05",
      cover_image: "/placeholder.svg?height=200&width=200&text=CCYLD",
    },
    {
      id: "a3",
      title: "Hoàng",
      artist: "Hoàng Thùy Linh",
      release_date: "2019-10-20",
      cover_image: "/placeholder.svg?height=200&width=200&text=H",
    },
  ]

  const mockLikedSongs = [
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
  ]

  if (!user) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
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
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${view === "grid" ? "bg-zinc-800" : "bg-transparent"}`}
              onClick={() => setView("grid")}
            >
              <Grid className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${view === "list" ? "bg-zinc-800" : "bg-transparent"}`}
              onClick={() => setView("list")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Thư viện của bạn</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Tìm kiếm trong thư viện"
                className="pl-9 bg-zinc-800 border-none h-10 text-white focus-visible:ring-0 w-60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Filter className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                <DropdownMenuItem
                  className={`cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700 ${filter === "all" ? "bg-zinc-700" : ""}`}
                  onClick={() => setFilter("all")}
                >
                  Tất cả
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700 ${filter === "playlists" ? "bg-zinc-700" : ""}`}
                  onClick={() => setFilter("playlists")}
                >
                  Danh sách phát
                </DropdownMenuItem>
                <DropdownMenuItem
                  className={`cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700 ${filter === "albums" ? "bg-zinc-700" : ""}`}
                  onClick={() => setFilter("albums")}
                >
                  Album
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/create-playlist">
              <Button className="bg-green-500 hover:bg-green-600 text-black">
                <Plus className="h-5 w-5 mr-2" />
                Tạo mới
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : filteredItems().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-zinc-800 rounded-full p-6 mb-4">
              <Search className="h-12 w-12 text-white/50" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Không tìm thấy kết quả</h2>
            <p className="text-white/70 max-w-md">
              {searchQuery
                ? `Không tìm thấy kết quả cho "${searchQuery}". Hãy thử tìm kiếm với từ khóa khác.`
                : "Thư viện của bạn đang trống. Hãy thêm nội dung vào thư viện của bạn."}
            </p>
          </div>
        ) : (
          <>
            {/* Grid view */}
            {view === "grid" && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {filteredItems().map((item) => {
                  const itemLink =
                    item.type === "playlist"
                      ? `/playlist/${item.id}`
                      : item.type === "album"
                        ? `/album/${item.id}`
                        : "/liked-songs"

                  return (
                    <Link href={itemLink} key={`${item.type}-${item.id}`}>
                      <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                        <div className="relative mb-4">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            width={200}
                            height={200}
                            alt={item.title}
                            className={`w-full ${item.type === "liked-songs" ? "rounded-full" : "rounded"}`}
                          />
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            <Play className="h-5 w-5 ml-0.5" />
                          </Button>
                        </div>
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-sm text-white/70 truncate">{item.subtitle}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* List view */}
            {view === "list" && (
              <div className="bg-zinc-800/30 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/10 text-white/70 text-sm">
                  <div>Tiêu đề</div>
                  <div className="text-right">Ngày thêm</div>
                  <div className="w-8"></div>
                </div>

                <div className="divide-y divide-white/10">
                  {filteredItems().map((item) => {
                    const itemLink =
                      item.type === "playlist"
                        ? `/playlist/${item.id}`
                        : item.type === "album"
                          ? `/album/${item.id}`
                          : "/liked-songs"

                    return (
                      <Link href={itemLink} key={`${item.type}-${item.id}`}>
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-4 hover:bg-zinc-800/50 group">
                          <div className="flex items-center gap-4">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              width={50}
                              height={50}
                              alt={item.title}
                              className={`${item.type === "liked-songs" ? "rounded-full" : "rounded"}`}
                            />
                            <div>
                              <div className="font-medium">{item.title}</div>
                              <div className="text-sm text-white/70">{item.subtitle}</div>
                            </div>
                          </div>
                          <div className="flex items-center text-white/70">{formatDate(item.date)}</div>
                          <div className="flex items-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full opacity-0 group-hover:opacity-100"
                            >
                              <Play className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
