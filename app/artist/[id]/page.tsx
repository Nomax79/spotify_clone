"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Play, Pause, Heart, MoreHorizontal, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { musicApi } from "@/lib/api"
import type { Song, Album } from "@/types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ArtistPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const artistId = params.id as string

  const [artist, setArtist] = useState<any>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [relatedArtists, setRelatedArtists] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Fetch artist data
  useEffect(() => {
    const fetchArtistData = async () => {
      if (!artistId) return

      try {
        setLoading(true)

        // In a real app, you would have an API endpoint for artist details
        // For now, we'll use mock data

        // Fetch songs by this artist
        const songsData = await musicApi.getSongs()
        const artistSongs = songsData.filter((song) => song.artist.includes(mockArtist.name))
        setSongs(artistSongs.length > 0 ? artistSongs : mockSongs)

        // Fetch albums by this artist
        const albumsData = await musicApi.getAlbums()
        const artistAlbums = albumsData.filter((album) => album.artist.includes(mockArtist.name))
        setAlbums(artistAlbums.length > 0 ? artistAlbums : mockAlbums)

        setArtist(mockArtist)
        setRelatedArtists(mockRelatedArtists)
      } catch (error) {
        console.error("Error fetching artist data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchArtistData()
  }, [artistId])

  const toggleFollow = async () => {
    try {
      // In a real app, you would call an API to follow/unfollow the artist
      setIsFollowing(!isFollowing)
    } catch (error) {
      console.error("Error toggling follow:", error)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // In a real app, you would start playing the artist's popular songs
  }

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Mock data for UI display when API data is not available
  const mockArtist = {
    id: artistId,
    name: "Sơn Tùng M-TP",
    bio: "Nguyễn Thanh Tùng, thường được biết đến với nghệ danh Sơn Tùng M-TP, là một ca sĩ, nhạc sĩ, nhà sản xuất âm nhạc và diễn viên người Việt Nam.",
    followers: 5200000,
    monthly_listeners: 8500000,
    profile_image: "/placeholder.svg?height=300&width=300&text=ST",
    cover_image: "/placeholder.svg?height=500&width=1500&text=SonTungMTP",
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
    },
    {
      id: "s2",
      title: "Có Chắc Yêu Là Đây",
      artist: "Sơn Tùng M-TP",
      album: "Có Chắc Yêu Là Đây (Single)",
      duration: 218,
      play_count: 12000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2020-07-05",
    },
    {
      id: "s3",
      title: "Chạy Ngay Đi",
      artist: "Sơn Tùng M-TP",
      album: "Chạy Ngay Đi (Single)",
      duration: 248,
      play_count: 18000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2018-05-12",
    },
    {
      id: "s4",
      title: "Lạc Trôi",
      artist: "Sơn Tùng M-TP",
      album: "Lạc Trôi (Single)",
      duration: 253,
      play_count: 20000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2017-01-01",
    },
    {
      id: "s5",
      title: "Nơi Này Có Anh",
      artist: "Sơn Tùng M-TP",
      album: "Nơi Này Có Anh (Single)",
      duration: 267,
      play_count: 22000000,
      cover_image: "/placeholder.svg?height=60&width=60",
      release_date: "2017-02-14",
    },
  ]

  const mockAlbums = [
    {
      id: "a1",
      title: "Chúng Ta Của Hiện Tại",
      artist: "Sơn Tùng M-TP",
      release_date: "2020-12-20",
      cover_image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "a2",
      title: "Có Chắc Yêu Là Đây",
      artist: "Sơn Tùng M-TP",
      release_date: "2020-07-05",
      cover_image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "a3",
      title: "Sky Tour",
      artist: "Sơn Tùng M-TP",
      release_date: "2019-08-01",
      cover_image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: "a4",
      title: "m-tp M-TP",
      artist: "Sơn Tùng M-TP",
      release_date: "2017-03-01",
      cover_image: "/placeholder.svg?height=200&width=200",
    },
  ]

  const mockRelatedArtists = [
    {
      id: "ra1",
      name: "Hương Ly",
      profile_image: "/placeholder.svg?height=200&width=200&text=HL",
    },
    {
      id: "ra2",
      name: "Bích Phương",
      profile_image: "/placeholder.svg?height=200&width=200&text=BP",
    },
    {
      id: "ra3",
      name: "HIEUTHUHAI",
      profile_image: "/placeholder.svg?height=200&width=200&text=HT",
    },
    {
      id: "ra4",
      name: "Hoàng Thùy Linh",
      profile_image: "/placeholder.svg?height=200&width=200&text=HTL",
    },
    {
      id: "ra5",
      name: "Đen Vâu",
      profile_image: "/placeholder.svg?height=200&width=200&text=DV",
    },
  ]

  if (loading || !artist) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Artist header */}
      <div
        className="relative h-80 bg-cover bg-center flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${artist.cover_image})`,
        }}
      >
        <div className="absolute top-4 left-4 flex items-center gap-2">
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

        <div className="container mx-auto px-6 py-8 flex items-center gap-6">
          <Image
            src={artist.profile_image || "/placeholder.svg"}
            width={160}
            height={160}
            alt={artist.name}
            className="rounded-full border-4 border-white/10"
          />
          <div>
            <div className="text-sm font-medium mb-2">Nghệ sĩ</div>
            <h1 className="text-5xl font-bold mb-2">{artist.name}</h1>
            <div className="text-white/70 mb-4">
              {artist.monthly_listeners.toLocaleString()} người nghe hàng tháng • {artist.followers.toLocaleString()}{" "}
              người theo dõi
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
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
            variant="outline"
            size="lg"
            className={`rounded-full border-white/30 ${isFollowing ? "bg-green-500 border-green-500 text-black" : ""}`}
            onClick={toggleFollow}
          >
            {isFollowing ? "Đang theo dõi" : "Theo dõi"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
              <DropdownMenuItem className="cursor-pointer hover:bg-zinc-700 focus:bg-zinc-700">
                Thêm vào thư viện
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

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-transparent mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
            >
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="songs"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
            >
              Bài hát
            </TabsTrigger>
            <TabsTrigger
              value="albums"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
            >
              Album
            </TabsTrigger>
            <TabsTrigger
              value="about"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-green-500 rounded-none"
            >
              Giới thiệu
            </TabsTrigger>
          </TabsList>

          {/* Popular songs */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Phổ biến</h2>
            <div className="space-y-2">
              {songs.slice(0, 5).map((song, index) => (
                <Link href={`/player?id=${song.id}`} key={song.id}>
                  <div className="flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 group">
                    <div className="w-8 text-center text-white/70 group-hover:hidden">{index + 1}</div>
                    <div className="w-8 text-center hidden group-hover:block">
                      <Play className="h-5 w-5 mx-auto" />
                    </div>
                    <Image
                      src={song.cover_image || "/placeholder.svg"}
                      width={40}
                      height={40}
                      alt={song.title}
                      className="rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{song.title}</div>
                      <div className="text-sm text-white/70 truncate">{song.play_count.toLocaleString()} lượt nghe</div>
                    </div>
                    <div className="text-white/70">{formatDuration(song.duration)}</div>
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
                </Link>
              ))}
            </div>
            <Button variant="link" className="text-white/70 hover:text-white mt-2">
              Xem tất cả
            </Button>
          </div>

          {/* Albums */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Album</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {albums.map((album) => (
                <Link href={`/album/${album.id}`} key={album.id}>
                  <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                    <div className="relative mb-4">
                      <Image
                        src={album.cover_image || "/placeholder.svg"}
                        width={200}
                        height={200}
                        alt={album.title}
                        className="rounded w-full"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <Play className="h-5 w-5 ml-0.5" />
                      </Button>
                    </div>
                    <div className="font-medium">{album.title}</div>
                    <div className="text-sm text-white/70">{new Date(album.release_date).getFullYear()} • Album</div>
                  </div>
                </Link>
              ))}
            </div>
            <Button variant="link" className="text-white/70 hover:text-white mt-2">
              Xem tất cả
            </Button>
          </div>

          {/* Related artists */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Nghệ sĩ tương tự</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {relatedArtists.map((relatedArtist) => (
                <Link href={`/artist/${relatedArtist.id}`} key={relatedArtist.id}>
                  <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                    <div className="relative mb-4">
                      <Image
                        src={relatedArtist.profile_image || "/placeholder.svg"}
                        width={200}
                        height={200}
                        alt={relatedArtist.name}
                        className="rounded-full w-full"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <Play className="h-5 w-5 ml-0.5" />
                      </Button>
                    </div>
                    <div className="font-medium text-center">{relatedArtist.name}</div>
                    <div className="text-sm text-white/70 text-center">Nghệ sĩ</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Image
                  src={artist.profile_image || "/placeholder.svg"}
                  width={400}
                  height={400}
                  alt={artist.name}
                  className="rounded-lg w-full"
                />
              </div>
              <div>
                <p className="text-white/70 mb-4">{artist.bio}</p>
                <div className="mb-4">
                  <div className="font-medium mb-1">Người theo dõi hàng tháng</div>
                  <div className="text-3xl font-bold">{artist.monthly_listeners.toLocaleString()}</div>
                </div>
                <div>
                  <div className="font-medium mb-1">Tổng số người theo dõi</div>
                  <div className="text-3xl font-bold">{artist.followers.toLocaleString()}</div>
                </div>
                <Button className="mt-6 bg-white text-black hover:bg-white/90">
                  <Share2 className="h-5 w-5 mr-2" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
