"use client"

import { useEffect, useState } from "react"
import { PlaylistType } from "@/components/music/PlaylistCard"
import { PlaylistCard } from "@/components/music/PlaylistCard"
import { postmanApi } from "@/lib/api/postman"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Library, Music, Search, Plus, ListMusic } from "lucide-react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// Định nghĩa kiểu dữ liệu API trả về
interface PlaylistApiResponse {
    id: number;
    name: string;
    description?: string;
    is_public: boolean;
    cover_image?: string | null;
    user?: {
        id: number;
        username: string;
    };
    songs_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface FeaturedPlaylistsResponse {
    playlists: PlaylistApiResponse[];
    total: number;
    page: number;
    page_size: number;
}

export default function PlaylistsPage() {
    const [playlists, setPlaylists] = useState<PlaylistType[]>([])
    const [featuredPlaylists, setFeaturedPlaylists] = useState<PlaylistType[]>([])
    const [myPlaylists, setMyPlaylists] = useState<PlaylistType[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (!user) {
            router.push("/")
            return
        }

        async function fetchPlaylists() {
            try {
                setLoading(true)

                // Lấy tất cả playlist
                const playlistsData = await postmanApi.music.getPlaylists() as PlaylistApiResponse[]

                // Lấy playlist nổi bật
                const featuredData = await postmanApi.music.getFeaturedPlaylists() as FeaturedPlaylistsResponse

                // Chuyển đổi định dạng dữ liệu cho phù hợp với PlaylistType
                const formatApiPlaylist = (playlist: PlaylistApiResponse): PlaylistType => ({
                    id: playlist.id,
                    name: playlist.name,
                    description: playlist.description || "",
                    is_public: playlist.is_public,
                    cover_image: playlist.cover_image || null,
                    user: {
                        id: playlist.user?.id || 0,
                        username: playlist.user?.username || "Unknown User",
                        avatar: null
                    },
                    songs_count: playlist.songs_count || 0,
                    created_at: playlist.created_at || new Date().toISOString(),
                    updated_at: playlist.updated_at || new Date().toISOString()
                })

                // Định dạng dữ liệu playlist
                const formattedPlaylists = playlistsData.map(formatApiPlaylist)

                // Định dạng dữ liệu playlist nổi bật
                const formattedFeatured = featuredData.playlists.map(formatApiPlaylist)

                // Lọc playlist của người dùng hiện tại
                const currentUserPlaylists = formattedPlaylists.filter(
                    (playlist) => user && String(playlist.user.id) === String(user.id)
                )

                setPlaylists(formattedPlaylists)
                setFeaturedPlaylists(formattedFeatured)
                setMyPlaylists(currentUserPlaylists)
            } catch (error) {
                console.error("Lỗi khi lấy danh sách playlist:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách playlist. Vui lòng thử lại sau.",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchPlaylists()
    }, [user, router, toast])

    const handleCreatePlaylist = () => {
        router.push("/create-playlist")
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Sidebar và nội dung chính */}
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
                            <Button variant="ghost" className="justify-start text-white bg-zinc-800">
                                <ListMusic className="mr-2 h-5 w-5" />
                                Playlists
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Nội dung chính */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold">Playlists</h1>
                        <Button
                            onClick={handleCreatePlaylist}
                            className="bg-green-500 hover:bg-green-600 text-black"
                        >
                            <Plus className="h-4 w-4 mr-2" /> Tạo Playlist
                        </Button>
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-6">
                            <TabsTrigger value="all">Tất cả</TabsTrigger>
                            <TabsTrigger value="featured">Nổi bật</TabsTrigger>
                            <TabsTrigger value="my-playlists">Playlist của tôi</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="aspect-square bg-zinc-800/40 rounded-md animate-pulse" />
                                    ))}
                                </div>
                            ) : playlists.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {playlists.map((playlist) => (
                                        <PlaylistCard key={playlist.id} playlist={playlist} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-zinc-400 mb-4">Không có playlist nào được tìm thấy</p>
                                    <Button onClick={handleCreatePlaylist}>Tạo playlist mới</Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="featured">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(10)].map((_, i) => (
                                        <div key={i} className="aspect-square bg-zinc-800/40 rounded-md animate-pulse" />
                                    ))}
                                </div>
                            ) : featuredPlaylists.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {featuredPlaylists.map((playlist) => (
                                        <PlaylistCard key={playlist.id} playlist={playlist} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-zinc-400">Không có playlist nổi bật nào được tìm thấy</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="my-playlists">
                            {loading ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="aspect-square bg-zinc-800/40 rounded-md animate-pulse" />
                                    ))}
                                </div>
                            ) : myPlaylists.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {myPlaylists.map((playlist) => (
                                        <PlaylistCard key={playlist.id} playlist={playlist} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-zinc-400 mb-4">Bạn chưa có playlist nào</p>
                                    <Button onClick={handleCreatePlaylist}>Tạo playlist mới</Button>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
} 