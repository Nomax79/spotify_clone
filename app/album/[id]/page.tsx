"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlbumType } from "@/components/music/AlbumCard"
import { SongType } from "@/components/music/SongCard"
import { SongRow } from "@/components/music/SongRow"
import { SongListHeader } from "@/components/music/SongListHeader"
import { usePlayer } from "@/components/player/PlayerContext"
import { PlayButton } from "@/components/music/PlayButton"
import { postmanApi } from "@/lib/api/postman"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Library, Search, Clock, MoreHorizontal, Music } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface AlbumPageProps {
  params: {
    id: string
  }
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const { id } = params
  const [album, setAlbum] = useState<any | null>(null)
  const [songs, setSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { play, currentSong, isPlaying, addToQueue, playlist: currentPlaylist } = usePlayer()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Kiểm tra nếu bài hát hiện tại có trùng với bài hát trong danh sách không
  const isSameId = (id1: any, id2: any): boolean => {
    return String(id1) === String(id2)
  }

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    async function fetchAlbum() {
      try {
        setLoading(true)
        const albumData = await postmanApi.music.getAlbum(id)

        // Nếu có dữ liệu songs trong albumData
        if (albumData && albumData.songs) {
          setAlbum(albumData)
          setSongs(albumData.songs || [])
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin album:", error)
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin album. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAlbum()
    }
  }, [id, user, router, toast])

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.getFullYear()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAlbum = () => {
    if (songs.length > 0) {
      // Chuyển đổi định dạng bài hát cho player
      const formattedSongs = songs.map(song => ({
        id: Number(song.id),
        title: song.title,
        duration: String(song.duration),
        file_url: song.audio_file || '',
        image_url: song.cover_image || album.cover_image || null,
        album: {
          id: Number(album.id),
          name: album.title,
          cover_image: album.cover_image || null
        },
        artist: typeof song.artist === 'string'
          ? { id: 0, name: song.artist, avatar: null }
          : { id: Number(song.artist.id || 0), name: song.artist.name || song.artist, avatar: null },
        created_at: song.created_at || new Date().toISOString(),
        updated_at: song.updated_at || new Date().toISOString()
      }))

      // Phát bài hát đầu tiên và thêm cả album vào danh sách phát
      play(formattedSongs[0], formattedSongs)
    }
  }

  const handlePlaySong = (song: any) => {
    // Chuyển đổi sang định dạng SongType
    const songToPlay = {
      id: Number(song.id),
      title: song.title,
      duration: String(song.duration),
      file_url: song.audio_file || '',
      image_url: song.cover_image || album.cover_image || null,
      album: {
        id: Number(album.id),
        name: album.title,
        cover_image: album.cover_image || null
      },
      artist: typeof song.artist === 'string'
        ? { id: 0, name: song.artist, avatar: null }
        : { id: Number(song.artist.id || 0), name: song.artist.name || song.artist, avatar: null },
      created_at: song.created_at || new Date().toISOString(),
      updated_at: song.updated_at || new Date().toISOString()
    };

    play(songToPlay);
  }

  // Xử lý thêm vào danh sách phát
  const handleAddToQueue = (e: React.MouseEvent, song: any) => {
    e.stopPropagation();

    // Kiểm tra nếu bài hát đang phát
    if (currentSong && isSameId(currentSong.id, song.id)) {
      toast({
        title: "Bài hát đang phát",
        description: `"${song.title}" đang được phát.`,
      });
      return;
    }

    // Kiểm tra nếu bài hát đã có trong hàng đợi
    if (currentPlaylist && currentPlaylist.some(item => isSameId(item.id, song.id) && !isSameId(item.id, currentSong?.id))) {
      toast({
        title: "Đã có trong hàng đợi",
        description: `"${song.title}" đã có trong danh sách phát.`,
      });
      return;
    }

    try {
      // Chuyển đổi sang định dạng SongType để sử dụng với PlayerContext
      const songToQueue = {
        id: Number(song.id),
        title: song.title,
        duration: String(song.duration),
        file_url: song.audio_file || '',
        image_url: song.cover_image || album.cover_image || null,
        album: {
          id: Number(album.id),
          name: album.title,
          cover_image: album.cover_image || null
        },
        artist: typeof song.artist === 'string'
          ? { id: 0, name: song.artist, avatar: null }
          : { id: Number(song.artist.id || 0), name: song.artist.name || song.artist, avatar: null },
        created_at: song.created_at || new Date().toISOString(),
        updated_at: song.updated_at || new Date().toISOString()
      };

      addToQueue(songToQueue);

      toast({
        title: "Đã thêm vào hàng đợi",
        description: `Đã thêm "${song.title}" vào danh sách phát.`,
      });
    } catch (error) {
      console.error("Lỗi khi thêm vào hàng đợi:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm bài hát vào hàng đợi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="flex h-screen">
          <div className="w-64 flex-shrink-0 bg-black p-4 hidden md:block">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Link href="/dashboard">
                  <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                    <Home className="mr-2 h-5 w-5" />
                    Trang chủ
                  </Button>
                </Link>
                <Link href="/search">
                  <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                    <Search className="mr-2 h-5 w-5" />
                    Tìm kiếm
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                    <Library className="mr-2 h-5 w-5" />
                    Thư viện
                  </Button>
                </Link>
                <Link href="/albums">
                  <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                    <Music className="mr-2 h-5 w-5" />
                    Albums
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black p-6">
            <div className="container mx-auto">
              <div className="flex flex-col md:flex-row gap-6 mb-8 animate-pulse">
                <div className="w-64 h-64 bg-zinc-800 rounded-md"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
                  <div className="h-6 bg-zinc-800 rounded w-1/4"></div>
                  <div className="h-4 bg-zinc-800 rounded w-1/5"></div>
                </div>
              </div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-800 rounded-md"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold mb-4">Album không tồn tại</h2>
          <p className="text-zinc-400 mb-6">Album này không tồn tại hoặc đã bị xóa</p>
          <Link href="/albums">
            <Button>Quay lại danh sách album</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex h-screen">
        <div className="w-64 flex-shrink-0 bg-black p-4 hidden md:block">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Home className="mr-2 h-5 w-5" />
                  Trang chủ
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Search className="mr-2 h-5 w-5" />
                  Tìm kiếm
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Library className="mr-2 h-5 w-5" />
                  Thư viện
                </Button>
              </Link>
              <Link href="/albums">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Music className="mr-2 h-5 w-5" />
                  Albums
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black">
          <div className="p-6">
            {/* Header album */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="relative rounded-md overflow-hidden w-64 h-64 shadow-lg flex-shrink-0">
                <Image
                  src={album.cover_image || "/placeholder.jpg"}
                  alt={album.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-end">
                <div className="text-sm font-medium mb-2">Album</div>
                <h1 className="text-4xl font-bold mb-4">{album.title}</h1>
                <div className="flex items-center gap-2 text-sm mb-6">
                  <span className="font-medium">
                    {typeof album.artist === 'string' ? album.artist : album.artist?.name || 'Unknown Artist'}
                  </span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-400">{formatDate(album.release_date)}</span>
                  <span className="text-zinc-400">•</span>
                  <span className="text-zinc-400">{songs.length} bài hát</span>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlayAlbum}
                    size="lg"
                    className="rounded-full bg-green-500 hover:bg-green-600 text-black px-8"
                    disabled={songs.length === 0}
                  >
                    Phát
                  </Button>
                </div>

                {album.description && (
                  <div className="mt-4 text-sm text-zinc-400 max-w-2xl">
                    <p>{album.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danh sách bài hát */}
            {songs.length > 0 ? (
              <div className="rounded-lg overflow-hidden mt-8">
                <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 border-b border-white/5 text-sm text-zinc-400">
                  <div className="w-10 text-center">#</div>
                  <div>Tiêu đề</div>
                  <div className="w-32 text-right">Thời lượng</div>
                  <div className="w-20"></div>
                </div>

                <div className="space-y-1 py-2">
                  {songs.map((song, index) => (
                    <div
                      key={song.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-4 hover:bg-white/5 items-center group cursor-pointer"
                      onClick={() => handlePlaySong(song)}
                    >
                      <div className="w-10 text-center text-zinc-400">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button
                          className="hidden group-hover:block"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlaySong(song)
                          }}
                        >
                          {currentSong && isSameId(currentSong.id, song.id) && isPlaying ? (
                            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <rect x="6" y="5" width="3" height="10" rx="1" />
                              <rect x="11" y="5" width="3" height="10" rx="1" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-10 w-10 flex-shrink-0">
                          <Image
                            src={song.cover_image || album.cover_image || "/placeholder.jpg"}
                            alt={song.title}
                            fill
                            className="object-cover rounded"
                          />
                          {currentSong && isSameId(currentSong.id, song.id) && isPlaying && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className={`font-medium truncate ${currentSong && isSameId(currentSong.id, song.id) ? 'text-green-500' : ''}`}>
                            {song.title}
                          </div>
                          <div className="text-sm text-zinc-400 truncate">
                            {typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown Artist'}
                          </div>
                        </div>
                      </div>

                      <div className="w-32 text-zinc-400 text-right">
                        {formatDuration(song.duration)}
                      </div>

                      <div className="w-20 flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-400"
                          onClick={(e) => handleAddToQueue(e, song)}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-zinc-400">Album này không có bài hát nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
