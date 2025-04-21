"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import {
  Search,
  Home,
  Library,
  Plus,
  ChevronLeft,
  ChevronRight,
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Mic2,
  ListMusic,
  Volume,
  Maximize2,
  Heart,
  MessageSquare,
  LogOut,
  User,
  ChevronDown,
  Pause,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { musicApi } from "@/lib/api/postman"
import type { Song, Playlist } from "@/types"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isPlaying, setIsPlaying] = useState(false)
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([])
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [trendingData, recommendedData, playlistsData] = await Promise.all([
          musicApi.getTrendingSongs(),
          musicApi.getRecommendedSongs(),
          musicApi.getPlaylists(),
        ])

        setTrendingSongs(trendingData)
        setRecommendedSongs(recommendedData)
        setPlaylists(playlistsData)

        // Set a default current song (first trending song)
        if (trendingData.length > 0 && !currentSong) {
          setCurrentSong(trendingData[0])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const playSong = (song: Song) => {
    setCurrentSong(song)
    setIsPlaying(true)
    // In a real app, you would trigger the audio player to play the song
  }

  // Mock data for UI display when API data is not available
  const mockSongs = [
    { id: "1", title: "Ngày Mai Em Đi", artist: "Lê Hiếu, SOOBIN, Touliver" },
    { id: "2", title: "vạn vật như muốn ta bên nhau", artist: "RIO" },
    { id: "3", title: "ADAMN", artist: "Bình Gold" },
    { id: "4", title: "Như Cách Anh Đã Từng Thôi", artist: "HURRYKNG" },
    { id: "5", title: "Jumping Machine (跳跳机)", artist: "LBI利比" },
    { id: "6", title: "Phép Màu - Đàn Cá Gỗ Original Soundtrack", artist: "MAYDAYs, Minh Tốc & Lâm" },
  ]

  const mockArtists = [
    { id: "1", name: "HIEUTHUHAI", type: "Nghệ sĩ" },
    { id: "2", name: "Sơn Tùng M-TP", type: "Nghệ sĩ" },
    { id: "3", name: "Dương Domic", type: "Nghệ sĩ" },
    { id: "4", name: "SOOBIN", type: "Nghệ sĩ" },
    { id: "5", name: 'ANH TRAI "SAY HI"', type: "Nghệ sĩ" },
    { id: "6", name: "buitruonglinh", type: "Nghệ sĩ" },
  ]

  const mockPlaylists = [
    { id: "1", title: "My Playlist #1", creator: user?.username || "User" },
    { id: "2", title: "Thiên Hạ Nghe Gì", creator: "Spotify" },
    { id: "3", title: "Tìm Lại Bầu Trời", creator: "Spotify" },
    { id: "4", title: "Bài hát đã thích", creator: user?.username || "User" },
  ]

  if (!user) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-black/90">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 78 24" width="78" height="24" className="text-white">
              <path
                fill="currentColor"
                d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
              />
            </svg>
            <span className="text-sm font-medium">Thư gọn Thư viện</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/messenger">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 cursor-pointer hover:bg-black/30 transition-colors">
                <Image
                  src="/placeholder.svg?height=32&width=32"
                  width={32}
                  height={32}
                  alt="Profile"
                  className="rounded-full"
                />
                <ChevronDown className="h-4 w-4 mr-1 text-white/70" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-800 border-zinc-700 text-white">
              <DropdownMenuItem
                className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700"
                onClick={() => router.push("/account")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Tài khoản</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 bg-black p-4 hidden md:block">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-white/70 hover:text-white">
                <Home className="mr-2 h-5 w-5" />
                Trang chủ
              </Button>
              <Link href="/search" className="w-full">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Search className="mr-2 h-5 w-5" />
                  Tìm kiếm
                </Button>
              </Link>
              <Link href="/library" className="w-full">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Library className="mr-2 h-5 w-5" />
                  Thư viện
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/create-playlist" className="w-full">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Plus className="mr-2 h-5 w-5" />
                  Tạo playlist
                </Button>
              </Link>
              <Link href="/liked-songs" className="w-full">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Heart className="mr-2 h-5 w-5" />
                  Bài hát đã thích
                </Button>
              </Link>
            </div>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Danh sách phát</span>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  Gần đây
                </Button>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 rounded hover:bg-white/10 cursor-pointer">
                  <div className="w-10 h-10 bg-purple-600 flex items-center justify-center rounded">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Bài hát đã thích</div>
                    <div className="text-xs text-white/70">Danh sách phát • 4 bài hát</div>
                  </div>
                </div>
                {(playlists.length > 0 ? playlists : mockPlaylists).slice(0, 3).map((playlist) => (
                  <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
                    <div className="flex items-center gap-3 p-2 rounded hover:bg-white/10 cursor-pointer">
                      <Image
                        src={playlist.cover_image || "/placeholder.svg?height=40&width=40"}
                        width={40}
                        height={40}
                        alt={playlist.title}
                        className="rounded"
                      />
                      <div>
                        <div className="text-sm font-medium">{playlist.title}</div>
                        <div className="text-xs text-white/70">
                          Danh sách phát • {playlist.created_by || user.username}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button className="bg-white text-black hover:bg-white/90">Nâng cấp</Button>
                <Button variant="ghost" size="icon" className="rounded-full bg-black/20 text-white">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="bg-transparent">
                <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800">
                  Tất cả
                </TabsTrigger>
                <TabsTrigger value="music" className="data-[state=active]:bg-zinc-800">
                  Âm nhạc
                </TabsTrigger>
                <TabsTrigger value="podcasts" className="data-[state=active]:bg-zinc-800">
                  Podcasts
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {(playlists.length > 0 ? playlists : mockPlaylists).map((playlist) => (
                <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
                  <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Image
                        src={playlist.cover_image || "/placeholder.svg?height=80&width=80"}
                        width={80}
                        height={80}
                        alt={playlist.title}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium">{playlist.title}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Dành Cho {user.username}</h2>
                <Button variant="link" className="text-white/70 hover:text-white">
                  Hiện tất cả
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(recommendedSongs.length > 0 ? recommendedSongs : mockSongs).slice(0, 5).map((song, index) => (
                  <div
                    key={song.id}
                    className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
                    onClick={() => playSong(song)}
                  >
                    <div className="relative">
                      <Image
                        src={song.cover_image || `/placeholder.svg?height=160&width=160&text=${index + 1}`}
                        width={160}
                        height={160}
                        alt={song.title}
                        className="rounded mb-4 w-full"
                      />
                      <div className="absolute bottom-6 left-4 bg-cyan-500 text-black px-2 py-1 text-xs font-medium rounded">
                        Đề xuất
                      </div>
                      <div className="absolute bottom-6 right-4 bg-black/80 text-white px-2 py-1 text-xs font-medium rounded">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <Button
                        size="icon"
                        className="absolute bottom-20 right-4 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          playSong(song)
                        }}
                      >
                        <Play className="h-5 w-5 ml-0.5" />
                      </Button>
                    </div>
                    <div className="text-sm font-medium">{song.title}</div>
                    <div className="text-xs text-white/70 line-clamp-2 mt-1">{song.artist}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Xu hướng</h2>
                <Link href="/trending">
                  <Button variant="link" className="text-white/70 hover:text-white">
                    Hiện tất cả <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {(trendingSongs.length > 0 ? trendingSongs : mockSongs).slice(0, 5).map((song, index) => (
                  <div
                    key={song.id}
                    className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
                    onClick={() => playSong(song)}
                  >
                    <div className="relative">
                      <Image
                        src={song.cover_image || `/placeholder.svg?height=160&width=160&text=${index + 1}`}
                        width={160}
                        height={160}
                        alt={song.title}
                        className="rounded mb-4 w-full"
                      />
                      <div className="absolute bottom-6 left-4 bg-red-500 text-black px-2 py-1 text-xs font-medium rounded">
                        Xu hướng
                      </div>
                      <div className="absolute bottom-6 right-4 bg-black/80 text-white px-2 py-1 text-xs font-medium rounded">
                        {(index + 1).toString().padStart(2, "0")}
                      </div>
                      <Button
                        size="icon"
                        className="absolute bottom-20 right-4 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          playSong(song)
                        }}
                      >
                        <Play className="h-5 w-5 ml-0.5" />
                      </Button>
                    </div>
                    <div className="text-sm font-medium">{song.title}</div>
                    <div className="text-xs text-white/70 line-clamp-2 mt-1">{song.artist}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Nghệ sĩ phổ biến</h2>
                <Link href="/artists">
                  <Button variant="link" className="text-white/70 hover:text-white">
                    Hiện tất cả <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {mockArtists.map((artist, index) => (
                  <Link href={`/artist/${artist.id}`} key={artist.id}>
                    <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                      <div className="relative mb-4">
                        <Image
                          src={`/placeholder.svg?height=160&width=160&text=${artist.name.charAt(0)}`}
                          width={160}
                          height={160}
                          alt={artist.name}
                          className="rounded-full w-full"
                        />
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <Play className="h-5 w-5 ml-0.5" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium line-clamp-1">{artist.name}</div>
                      <div className="text-xs text-white/70 line-clamp-1 mt-1">{artist.type}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="h-20 bg-zinc-900 border-t border-white/10 flex items-center px-4">
        <div className="flex items-center gap-4 w-1/3">
          {currentSong && (
            <>
              <Image
                src={currentSong.cover_image || "/placeholder.svg?height=56&width=56"}
                width={56}
                height={56}
                alt={currentSong.title}
                className="rounded"
              />
              <div>
                <div className="font-medium">{currentSong.title}</div>
                <div className="text-xs text-white/70">{currentSong.artist}</div>
              </div>
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <Heart className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-1">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-white text-black hover:bg-white/90"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Repeat className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-md">
            <div className="text-xs text-white/70">0:35</div>
            <Slider defaultValue={[30]} max={100} step={1} className="flex-1" />
            <div className="text-xs text-white/70">3:38</div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 w-1/3">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <Mic2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <ListMusic className="h-4 w-4" />
          </Button>
          <Link href="/messenger">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <Volume className="h-4 w-4" />
            </Button>
            <Slider defaultValue={[70]} max={100} step={1} className="w-24" />
          </div>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function Bell(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}
