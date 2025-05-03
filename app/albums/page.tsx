"use client"

import { useEffect, useState } from "react"
import { AlbumType } from "@/components/music/AlbumCard"
import { AlbumCard } from "@/components/music/AlbumCard"
import { postmanApi } from "@/lib/api/postman"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Library, Music, Search } from "lucide-react"

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<AlbumType[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!user) {
            router.push("/")
            return
        }

        async function fetchAlbums() {
            try {
                setLoading(true)
                const albumsData = await postmanApi.music.getAlbums()
                // Chuyển đổi dữ liệu từ API về định dạng AlbumType
                const formattedAlbums = albumsData.map((album: any) => ({
                    id: album.id,
                    title: album.title,
                    release_date: album.release_date || new Date().toISOString(),
                    cover_image: album.cover_image,
                    artist: {
                        id: typeof album.artist === "string" ? 0 : album.artist?.id || 0,
                        name: typeof album.artist === "string" ? album.artist : album.artist?.name || "Unknown Artist",
                        avatar: null
                    },
                    songs_count: album.songs_count || 0,
                    created_at: album.created_at || new Date().toISOString(),
                    updated_at: album.updated_at || new Date().toISOString()
                }));
                setAlbums(formattedAlbums)
            } catch (error) {
                console.error("Lỗi khi lấy danh sách album:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAlbums()
    }, [user, router])

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Sidebar */}
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
                            <Button variant="ghost" className="justify-start text-white bg-zinc-800">
                                <Music className="mr-2 h-5 w-5" />
                                Albums
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black p-6">
                    <h1 className="text-3xl font-bold mb-6">Tất cả album</h1>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="aspect-square bg-zinc-800/40 rounded-md animate-pulse" />
                            ))}
                        </div>
                    ) : albums.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {albums.map((album) => (
                                <AlbumCard key={album.id} album={album} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-zinc-400 mb-4">Không có album nào được tìm thấy</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 