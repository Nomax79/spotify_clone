"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Play, Pause, Heart, MoreHorizontal, Clock, ChevronLeft, ChevronRight, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { musicApi } from "@/lib/api"
import type { Song, Album } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AlbumPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const albumId = params.id as string

  const [album, setAlbum] = useState<Album | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [isLiked, setIsLiked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (user?.username === "admin") {
      
      router.push("/admin")
    }
  }, [user, router])

  // Fetch album data
  useEffect(() => {
    const fetchAlbumData = async () => {
      if (!albumId) return

      try {
        setLoading(true)

        // Fetch album details
        const albumData = await musicApi.getAlbum(albumId) as Album
        setAlbum(albumData || mockAlbum)

        // Fetch songs in this album
        const songsData = await musicApi.getAlbumSongs(albumId) as Song[]
        setSongs(songsData.length > 0 ? songsData : mockSongs)
      } catch (error) {
        console.error("Error fetching album data:", error)
        // Use mock data if API fails
        setSongs(mockSongs)
      } finally {
        setLoading(false)
      }
    }

    fetchAlbumData()
  }, [albumId])

  const toggleLike = async () => {
    try {
      // In a real app, you would call an API to like/unlike the album
      setIsLiked(!isLiked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // In a real app, you would start playing the album
  }

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Calculate total duration of all songs
  const calculateTotalDuration = () => {
    const totalSeconds = songs.reduce((total, song) => total + song.duration, 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    } else {
      return `${minutes} phút`
    }
  }

  // Mock data for UI display when API data is not available
  const mockAlbum = {
    id: albumId,
    title: "Chúng Ta Của Hiện Tại",
    artist: "Sơn Tùng M-TP",
    release_date: "2020-12-20",
    cover_image: "/placeholder.svg?height=300&width=300",
    description: "Album đơn của Sơn Tùng M-TP phát hành vào cuối năm 2020.",
  }

  const mockSongs = [
    {
      id: "s1",
      title: "Chúng Ta Của Hiện Tại",
      artist: "Sơn Tùng M-TP",
      album: "Chúng Ta Của Hiện Tại (Single)",
      duration: 289,
      play_count: 15000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2020-12-20",
      file_path: "/songs/chung-ta-cua-hien-tai.mp3",
      created_at: "2020-12-20T00:00:00Z",
    },
    {
      id: "s2",
      title: "Chúng Ta Của Hiện Tại (Acoustic Version)",
      artist: "Sơn Tùng M-TP",
      album: "Chúng Ta Của Hiện Tại (Single)",
      duration: 302,
      play_count: 8000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2020-12-20",
      file_path: "/songs/chung-ta-cua-hien-tai-acoustic.mp3",
      created_at: "2020-12-20T00:00:00Z",
    },
    {
      id: "s3",
      title: "Chúng Ta Của Hiện Tại (Instrumental)",
      artist: "Sơn Tùng M-TP",
      album: "Chúng Ta Của Hiện Tại (Single)",
      duration: 289,
      play_count: 3000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2020-12-20",
      file_path: "/songs/chung-ta-cua-hien-tai-instrumental.mp3",
      created_at: "2020-12-20T00:00:00Z",
    },
  ]

  if (loading || !album) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-800 to-black text-white">
      {/* Album header */}
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

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-8">
          <Image
            src={album.cover_image || "/placeholder.svg"}
            width={250}
            height={250}
            alt={album.title}
            className="rounded-lg shadow-2xl"
          />
          <div>
            <div className="text-sm font-medium mb-2">Album</div>
            <h1 className="text-5xl font-bold mb-2">{album.title}</h1>
            <div className="flex items-center gap-2 text-white/70 mb-4">
              <Link href={`/artist/${album.artist.replace(/\s+/g, "-").toLowerCase()}`} className="hover:underline">
                <span className="font-medium">{album.artist}</span>
              </Link>
              <span>•</span>
              <span>{new Date(album.release_date).getFullYear()}</span>
              <span>•</span>
              <span>
                {songs.length} bài hát, {calculateTotalDuration()}
              </span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            size="lg"
            className={`rounded-full ${isPlaying ? "bg-green-500 text-black" : "bg-white text-black"}`}
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2 ml-1" />}
            {isPlaying ? "Tạm dừng" : "Phát"}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isLiked ? "text-green-500" : "text-white/70"}`}
            onClick={toggleLike}
          >
            <Heart className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full text-white/70">
            <Download className="h-6 w-6" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full text-white/70">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                Thêm vào danh sách phát
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                Thêm vào hàng đợi
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                Chia sẻ
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                Báo cáo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Song list */}
        <div className="mb-8">
          <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 border-b border-white/10 text-white/70 text-sm">
            <div className="w-8 text-center">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Lượt nghe</div>
            <div className="flex items-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {songs.map((song, index) => (
              <Link href={`/player?id=${song.id}`} key={song.id}>
                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto] gap-4 p-2 rounded-md hover:bg-zinc-800/50 group">
                  <div className="w-8 text-center text-white/70 group-hover:hidden">{index + 1}</div>
                  <div className="w-8 text-center hidden group-hover:block">
                    <Play className="h-5 w-5 mx-auto" />
                  </div>
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
                  <div className="hidden md:flex items-center text-white/70">{(song.play_count ?? 0).toLocaleString()}</div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/70">{formatDuration(song.duration)}</span>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                          Thêm vào danh sách phát
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                          Thêm vào hàng đợi
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                          Chia sẻ
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Album info */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Giới thiệu</h2>
          <p className="text-white/70 mb-4">{album.description || "Không có thông tin mô tả cho album này."}</p>
          <div className="text-sm text-white/50">Phát hành: {new Date(album.release_date).toLocaleDateString()}</div>
        </div>

        {/* Copyright */}
        <div className="text-sm text-white/50 mb-8">
          © {new Date(album.release_date).getFullYear()} {album.artist}. Bản quyền thuộc về chủ sở hữu.
        </div>
      </div>
    </div>
  )
}
