"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { PlaylistType } from "@/components/music/PlaylistCard"
import { SongType } from "@/components/music/SongCard"
import { usePlayer } from "@/components/player/PlayerContext"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Library, Music, Search, ListMusic, Clock, MoreHorizontal, Heart, Share2, PenSquare, Trash2, Lock, Unlock, Upload } from "lucide-react"
import { postmanApi } from "@/lib/api/postman"
import { useToast } from "@/hooks/use-toast"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlaylistPageProps {
    params: {
        id: string
    }
}

type PlaylistResponse = {
    id: number;
    name: string;
    description?: string;
    cover_image?: string | null;
    is_public: boolean;
    user?: {
        id: number | string;
        username: string;
    };
    songs?: any[];
    created_at: string;
    updated_at: string;
    followers_count?: number;
}

interface AlbumType {
    id: number;
    title: string;
    cover_image?: string | null;
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
    const { id } = params
    const [playlist, setPlaylist] = useState<PlaylistResponse | null>(null)
    const [songs, setSongs] = useState<any[]>([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isOwner, setIsOwner] = useState(false)
    const [showDeleteAlert, setShowDeleteAlert] = useState(false)
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

        async function fetchPlaylist() {
            try {
                setLoading(true)
                const playlistData = await postmanApi.music.getPlaylist(id) as PlaylistResponse

                if (playlistData) {
                    setPlaylist(playlistData)
                    // Kiểm tra nếu songs tồn tại trong dữ liệu trả về
                    if (Array.isArray(playlistData.songs)) {
                        setSongs(playlistData.songs)
                    } else {
                        setSongs([])
                    }

                    // Kiểm tra nếu người dùng hiện tại là chủ sở hữu playlist
                    if (user && playlistData.user && String(playlistData.user.id) === String(user.id)) {
                        setIsOwner(true)
                    }

                    // Kiểm tra nếu người dùng đang theo dõi playlist
                    try {
                        const followingResponse = await postmanApi.music.checkFollowingPlaylist(id) as { is_following?: boolean } | boolean
                        // Kiểm tra cấu trúc phản hồi
                        if (typeof followingResponse === 'boolean') {
                            setIsFollowing(followingResponse)
                        } else if (followingResponse && typeof followingResponse === 'object' && 'is_following' in followingResponse) {
                            setIsFollowing(followingResponse.is_following === true)
                        }
                    } catch (error) {
                        console.error("Lỗi khi kiểm tra trạng thái theo dõi:", error)
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin playlist:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin playlist. Vui lòng thử lại sau.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchPlaylist()
        }
    }, [id, user, router, toast])

    const formatDate = (dateString: string) => {
        if (!dateString) return ""
        const date = new Date(dateString)
        const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
        return date.toLocaleDateString('vi-VN', options)
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const handlePlayPlaylist = () => {
        if (songs.length > 0) {
            // Chuyển đổi định dạng bài hát cho player
            const formattedSongs = songs.map(song => {
                const albumData: AlbumType = {
                    id: Number(song.album?.id || 0),
                    title: song.album?.title || song.album?.name || "Unknown Album"
                }

                if (song.album?.cover_image) {
                    albumData.cover_image = song.album.cover_image;
                }

                return {
                    id: Number(song.id),
                    title: song.title,
                    duration: String(song.duration),
                    file_url: song.audio_file || '',
                    image_url: song.cover_image || playlist?.cover_image || null,
                    album: albumData,
                    artist: typeof song.artist === 'string'
                        ? { id: 0, name: song.artist, avatar: null }
                        : { id: Number(song.artist?.id || 0), name: song.artist?.name || "Unknown Artist", avatar: null },
                    created_at: song.created_at || new Date().toISOString(),
                    updated_at: song.updated_at || new Date().toISOString()
                }
            }) as SongType[]

            // Phát bài hát đầu tiên và thêm cả playlist vào danh sách phát
            play(formattedSongs[0], formattedSongs)
        }
    }

    const handlePlaySong = (song: any) => {
        // Chuyển đổi sang định dạng SongType
        const albumData: AlbumType = {
            id: Number(song.album?.id || 0),
            title: song.album?.title || song.album?.name || "Unknown Album"
        }

        if (song.album?.cover_image) {
            albumData.cover_image = song.album.cover_image;
        }

        const songToPlay: SongType = {
            id: Number(song.id),
            title: song.title,
            duration: String(song.duration),
            file_url: song.audio_file || '',
            image_url: song.cover_image || playlist?.cover_image || null,
            album: albumData,
            artist: typeof song.artist === 'string'
                ? { id: 0, name: song.artist, avatar: null }
                : { id: Number(song.artist?.id || 0), name: song.artist?.name || "Unknown Artist", avatar: null },
            created_at: song.created_at || new Date().toISOString(),
            updated_at: song.updated_at || new Date().toISOString()
        }

        play(songToPlay)
    }

    // Xử lý theo dõi/bỏ theo dõi playlist
    const handleToggleFollow = async () => {
        if (!playlist) return;

        try {
            if (isFollowing) {
                // Bỏ theo dõi playlist
                await postmanApi.music.unfollowPlaylist(id)
                setIsFollowing(false)
                toast({
                    title: "Đã bỏ theo dõi",
                    description: `Đã bỏ theo dõi playlist "${playlist.name}".`,
                })
            } else {
                // Theo dõi playlist
                await postmanApi.music.followPlaylist(id)
                setIsFollowing(true)
                toast({
                    title: "Đã theo dõi",
                    description: `Đã theo dõi playlist "${playlist.name}".`,
                })
            }
        } catch (error) {
            console.error("Lỗi khi thay đổi trạng thái theo dõi:", error)
            toast({
                title: "Lỗi",
                description: "Không thể thay đổi trạng thái theo dõi. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        }
    }

    // Xử lý chuyển đổi chế độ công khai/riêng tư
    const handleTogglePrivacy = async () => {
        if (!isOwner || !playlist) return;

        try {
            await postmanApi.music.togglePlaylistPrivacy(id)

            // Cập nhật lại trạng thái playlist
            const updatedPlaylist: PlaylistResponse = {
                ...playlist,
                is_public: !playlist.is_public
            };

            setPlaylist(updatedPlaylist);

            toast({
                title: "Đã thay đổi",
                description: updatedPlaylist.is_public
                    ? "Đã chuyển playlist sang chế độ công khai."
                    : "Đã chuyển playlist sang chế độ riêng tư.",
            })
        } catch (error) {
            console.error("Lỗi khi thay đổi chế độ riêng tư:", error)
            toast({
                title: "Lỗi",
                description: "Không thể thay đổi chế độ riêng tư. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        }
    }

    // Xử lý xóa playlist
    const handleDeletePlaylist = async () => {
        if (!isOwner) return

        try {
            await postmanApi.music.deletePlaylist(id)
            toast({
                title: "Đã xóa",
                description: "Playlist đã được xóa thành công.",
            })
            router.push("/playlists")
        } catch (error) {
            console.error("Lỗi khi xóa playlist:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xóa playlist. Vui lòng thử lại sau.",
                variant: "destructive",
            })
        }
    }

    // Xử lý thêm vào hàng đợi bài hát
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
            const albumData: AlbumType = {
                id: Number(song.album?.id || 0),
                title: song.album?.title || song.album?.name || "Unknown Album"
            }

            if (song.album?.cover_image) {
                albumData.cover_image = song.album.cover_image;
            }

            const songToQueue: SongType = {
                id: Number(song.id),
                title: song.title,
                duration: String(song.duration),
                file_url: song.audio_file || '',
                image_url: song.cover_image || playlist?.cover_image || null,
                album: albumData,
                artist: typeof song.artist === 'string'
                    ? { id: 0, name: song.artist, avatar: null }
                    : { id: Number(song.artist?.id || 0), name: song.artist?.name || "Unknown Artist", avatar: null },
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

    // Xử lý xóa bài hát khỏi playlist
    const handleRemoveSong = async (e: React.MouseEvent, song: any) => {
        e.stopPropagation();

        if (!isOwner) return;

        try {
            await postmanApi.music.removePlaylistSong(id, song.id)

            // Cập nhật lại danh sách bài hát
            setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id))

            toast({
                title: "Đã xóa bài hát",
                description: `Đã xóa "${song.title}" khỏi playlist.`,
            });
        } catch (error) {
            console.error("Lỗi khi xóa bài hát khỏi playlist:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa bài hát khỏi playlist. Vui lòng thử lại sau.",
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
                                <Link href="/playlists">
                                    <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                                        <ListMusic className="mr-2 h-5 w-5" />
                                        Playlists
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

    if (!playlist) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <div className="text-center py-10">
                    <h2 className="text-2xl font-bold mb-4">Playlist không tồn tại</h2>
                    <p className="text-zinc-400 mb-6">Playlist này không tồn tại hoặc đã bị xóa</p>
                    <Link href="/playlists">
                        <Button>Quay lại danh sách playlist</Button>
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
                            <Link href="/playlists">
                                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                                    <ListMusic className="mr-2 h-5 w-5" />
                                    Playlists
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black">
                    <div className="p-6">
                        {/* Header playlist */}
                        <div className="flex flex-col md:flex-row gap-6 mb-8">
                            <div className="relative rounded-md overflow-hidden w-64 h-64 shadow-lg flex-shrink-0">
                                <Image
                                    src={playlist.cover_image || "/placeholder.jpg"}
                                    alt={playlist.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-end">
                                <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium">Playlist</div>
                                    {!playlist.is_public && (
                                        <div className="bg-zinc-800 px-2 py-1 rounded text-xs">Riêng tư</div>
                                    )}
                                </div>
                                <h1 className="text-4xl font-bold mb-4">{playlist.name}</h1>
                                {playlist.description && (
                                    <p className="text-sm text-zinc-400 mb-4 max-w-2xl">{playlist.description}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm mb-6">
                                    <span className="font-medium">
                                        Tạo bởi {playlist.user?.username || 'Unknown User'}
                                    </span>
                                    <span className="text-zinc-400">•</span>
                                    <span className="text-zinc-400">{songs.length} bài hát</span>
                                    {playlist.followers_count && playlist.followers_count > 0 && (
                                        <>
                                            <span className="text-zinc-400">•</span>
                                            <span className="text-zinc-400">{playlist.followers_count} người theo dõi</span>
                                        </>
                                    )}
                                    <span className="text-zinc-400">•</span>
                                    <span className="text-zinc-400">Tạo ngày {formatDate(playlist.created_at)}</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Button
                                        onClick={handlePlayPlaylist}
                                        size="lg"
                                        className="rounded-full bg-green-500 hover:bg-green-600 text-black px-8"
                                        disabled={songs.length === 0}
                                    >
                                        Phát
                                    </Button>

                                    {!isOwner && (
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className={`rounded-full ${isFollowing ? 'text-green-500 border-green-500' : 'text-white/70 border-white/10'}`}
                                            onClick={handleToggleFollow}
                                        >
                                            <Heart className={`h-5 w-5 ${isFollowing ? 'fill-green-500' : ''}`} />
                                        </Button>
                                    )}

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-full text-white/70 border-white/10">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                                            {isOwner ? (
                                                <>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={handleTogglePrivacy}
                                                    >
                                                        {playlist.is_public ? (
                                                            <>
                                                                <Lock className="h-4 w-4 text-zinc-400" />
                                                                <span>Đặt là riêng tư</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Unlock className="h-4 w-4 text-zinc-400" />
                                                                <span>Đặt là công khai</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <Link href={`/edit-playlist/${playlist.id}`}>
                                                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                            <PenSquare className="h-4 w-4 text-zinc-400" />
                                                            <span>Chỉnh sửa chi tiết</span>
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() => setShowDeleteAlert(true)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                        <span className="text-red-500">Xóa playlist</span>
                                                    </DropdownMenuItem>
                                                </>
                                            ) : (
                                                <DropdownMenuItem
                                                    className="flex items-center gap-2 cursor-pointer"
                                                    onClick={handleToggleFollow}
                                                >
                                                    {isFollowing ? (
                                                        <>
                                                            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                                                            <span>Bỏ theo dõi</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Heart className="h-4 w-4 text-zinc-400" />
                                                            <span>Theo dõi</span>
                                                        </>
                                                    )}
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuSeparator className="bg-zinc-700" />

                                            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                                                <Share2 className="h-4 w-4 text-zinc-400" />
                                                <span>Chia sẻ</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
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
                                                        src={song.cover_image || playlist.cover_image || "/placeholder.jpg"}
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
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-400"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700 text-white">
                                                        <DropdownMenuItem
                                                            className="flex items-center gap-2 cursor-pointer"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleAddToQueue(e, song)
                                                            }}
                                                        >
                                                            <ListMusic className="h-4 w-4 text-zinc-400" />
                                                            <span>Thêm vào hàng đợi</span>
                                                        </DropdownMenuItem>

                                                        {isOwner && (
                                                            <>
                                                                <DropdownMenuSeparator className="bg-zinc-700" />
                                                                <DropdownMenuItem
                                                                    className="flex items-center gap-2 cursor-pointer text-red-500"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleRemoveSong(e, song)
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                                    <span>Xóa khỏi playlist</span>
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-zinc-400 mb-4">Playlist này chưa có bài hát nào</p>
                                {isOwner && (
                                    <Link href={`/edit-playlist/${playlist.id}`}>
                                        <Button>Thêm bài hát vào playlist</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Alert xác nhận xóa playlist */}
            <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            Hành động này sẽ xóa vĩnh viễn playlist "{playlist.name}" và không thể khôi phục lại.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent text-white hover:bg-zinc-800 border-zinc-700">
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleDeletePlaylist}
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 