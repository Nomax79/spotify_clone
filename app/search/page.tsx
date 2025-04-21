"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Search, Home, Library, Plus, Heart, ChevronLeft, ChevronRight, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { musicApi } from "@/lib/api"
import type { Song, Album, Playlist } from "@/types"

export default function SearchPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<{
    songs: Song[]
    albums: Album[]
    playlists: Playlist[]
  }>({
    songs: [],
    albums: [],
    playlists: [],
  })
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([])

  // If user is not logged in, redirect to home page
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem("recent_searches")
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches))
    }

    // Fetch genres for browse categories
    const fetchGenres = async () => {
      try {
        const genresData = await musicApi.getGenres()
        setGenres(genresData)
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    fetchGenres()
  }, [])

  // Search function
  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const searchResults = await musicApi.search(query)
      setResults(searchResults)

      // Save to recent searches
      const updatedSearches = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5)
      setRecentSearches(updatedSearches)
      localStorage.setItem("recent_searches", JSON.stringify(updatedSearches))
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Mock data for UI display when API data is not available
  const mockGenres = [
    { id: "1", name: "Pop" },
    { id: "2", name: "Hip-Hop" },
    { id: "3", name: "Rock" },
    { id: "4", name: "R&B" },
    { id: "5", name: "K-Pop" },
    { id: "6", name: "V-Pop" },
    { id: "7", name: "EDM" },
    { id: "8", name: "Jazz" },
    { id: "9", name: "Classical" },
    { id: "10", name: "Metal" },
  ]

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
              <Button variant="ghost" className="justify-start text-white hover:text-white bg-zinc-800">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
              <Link href="/library">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Library className="mr-2 h-5 w-5" />
                  Thư viện
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/create-playlist">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Plus className="mr-2 h-5 w-5" />
                  Tạo playlist
                </Button>
              </Link>
              <Link href="/liked-songs">
                <Button variant="ghost" className="justify-start text-white/70 hover:text-white w-full">
                  <Heart className="mr-2 h-5 w-5" />
                  Bài hát đã thích
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-zinc-900 to-black">
          <div className="p-6">
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
            </div>

            {/* Search input */}
            <div className="relative mb-8 max-w-3xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <Input
                placeholder="Bạn muốn nghe gì?"
                className="pl-10 bg-zinc-800 border-none h-12 text-white focus-visible:ring-0"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {query && (
                <Button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-black"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  Tìm kiếm
                </Button>
              )}
            </div>

            {/* Search results */}
            {query && results.songs.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Bài hát</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {results.songs.map((song) => (
                    <div
                      key={song.id}
                      className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
                    >
                      <div className="relative mb-4">
                        <Image
                          src={song.cover_image || "/placeholder.svg?height=160&width=160"}
                          width={160}
                          height={160}
                          alt={song.title}
                          className="rounded w-full"
                        />
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                        >
                          <Play className="h-5 w-5 ml-0.5" />
                        </Button>
                      </div>
                      <div className="text-sm font-medium line-clamp-1">{song.title}</div>
                      <div className="text-xs text-white/70 line-clamp-1 mt-1">{song.artist}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {query && results.albums.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Album</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {results.albums.map((album) => (
                    <Link href={`/album/${album.id}`} key={album.id}>
                      <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                        <div className="relative mb-4">
                          <Image
                            src={album.cover_image || "/placeholder.svg?height=160&width=160"}
                            width={160}
                            height={160}
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
                        <div className="text-sm font-medium line-clamp-1">{album.title}</div>
                        <div className="text-xs text-white/70 line-clamp-1 mt-1">{album.artist}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {query && results.playlists.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Playlist</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {results.playlists.map((playlist) => (
                    <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
                      <div className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group">
                        <div className="relative mb-4">
                          <Image
                            src={playlist.cover_image || "/placeholder.svg?height=160&width=160"}
                            width={160}
                            height={160}
                            alt={playlist.title}
                            className="rounded w-full"
                          />
                          <Button
                            size="icon"
                            className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                          >
                            <Play className="h-5 w-5 ml-0.5" />
                          </Button>
                        </div>
                        <div className="text-sm font-medium line-clamp-1">{playlist.title}</div>
                        <div className="text-xs text-white/70 line-clamp-1 mt-1">Playlist • {playlist.created_by}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Tìm kiếm gần đây</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer"
                      onClick={() => {
                        setQuery(search)
                        handleSearch()
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-700 flex items-center justify-center rounded">
                          <Search className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-sm font-medium">{search}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Browse categories */}
            {!query && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Duyệt tất cả</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {(genres.length > 0 ? genres : mockGenres).map((genre) => (
                    <Link href={`/genre/${genre.id}`} key={genre.id}>
                      <div
                        className="bg-gradient-to-br from-purple-600 to-blue-500 p-6 rounded-lg hover:from-purple-500 hover:to-blue-400 transition cursor-pointer h-40 flex items-end"
                        style={{
                          background: `linear-gradient(to bottom right, ${getRandomColor()}, ${getRandomColor()})`,
                        }}
                      >
                        <h3 className="text-xl font-bold">{genre.name}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate random colors for genre cards
function getRandomColor() {
  const colors = [
    "#FF5733",
    "#C70039",
    "#900C3F",
    "#581845",
    "#FFC300",
    "#DAF7A6",
    "#FF5733",
    "#C70039",
    "#2E86C1",
    "#17A589",
    "#D35400",
    "#7D3C98",
    "#2471A3",
    "#138D75",
    "#E74C3C",
    "#8E44AD",
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
