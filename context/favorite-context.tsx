"use client"

import {
    createContext,
    useContext,
    ReactNode,
    useState,
    useEffect,
    useCallback,
    useMemo
} from "react"
import { useAuth } from "@/context/auth-context"
import { toast } from "@/components/ui/use-toast"
import { SongType } from "@/components/music/SongCard"
import { api } from "@/lib/api"
import postmanApi from "@/lib/api/postman"

type FavoriteContextType = {
    favoriteSongs: SongType[]
    isLoading: boolean
    isFavorite: (songId: string | number) => boolean
    toggleFavorite: (song: SongType) => Promise<boolean>
    addToFavorites: (song: SongType) => Promise<boolean>
    removeFromFavorites: (song: SongType) => Promise<boolean>
    refreshFavorites: () => Promise<void>
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined)

export function FavoriteProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth()
    const [favoriteSongs, setFavoriteSongs] = useState<SongType[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Lấy danh sách bài hát yêu thích khi người dùng đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            refreshFavorites()
        } else {
            // Xóa cache khi người dùng đăng xuất
            setFavoriteSongs([])
            localStorage.removeItem('favoriteSongs')
        }
    }, [isAuthenticated])

    // Lấy danh sách yêu thích từ API
    const fetchFavorites = useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/v1/music/favorites/', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('spotify_token')}`
                }
            })

            if (!response.ok) {
                throw new Error('Không thể lấy danh sách bài hát yêu thích')
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài hát yêu thích:', error)
            return []
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Làm mới danh sách bài hát yêu thích
    const refreshFavorites = useCallback(async () => {
        if (!isAuthenticated) return

        try {
            setIsLoading(true)
            // Thực hiện chức năng caching
            const cachedFavs = localStorage.getItem('favoriteSongs')
            const cachedTime = localStorage.getItem('favoriteSongsTime')

            // Nếu có cache và dưới 5 phút, sử dụng cache
            if (cachedFavs && cachedTime) {
                const timeElapsed = Date.now() - parseInt(cachedTime)
                if (timeElapsed < 300000) { // 5 phút
                    setFavoriteSongs(JSON.parse(cachedFavs))
                    setLastUpdated(new Date(parseInt(cachedTime)))
                    setIsLoading(false)
                    return
                }
            }

            // Không có cache hoặc cache đã cũ, gọi API
            const favorites = await fetchFavorites()
            setFavoriteSongs(favorites)

            // Lưu vào cache
            localStorage.setItem('favoriteSongs', JSON.stringify(favorites))
            localStorage.setItem('favoriteSongsTime', Date.now().toString())
            setLastUpdated(new Date())
        } catch (error) {
            console.error('Lỗi khi làm mới danh sách bài hát yêu thích:', error)
        } finally {
            setIsLoading(false)
        }
    }, [isAuthenticated, fetchFavorites])

    // Kiểm tra xem bài hát có trong danh sách yêu thích không
    const isFavorite = useCallback((songId: string | number) => {
        return favoriteSongs.some(song => song.id.toString() === songId.toString())
    }, [favoriteSongs])

    // Thêm bài hát vào danh sách yêu thích
    const addToFavorites = useCallback(async (song: SongType) => {
        if (!isAuthenticated) {
            toast({
                title: "Yêu cầu đăng nhập",
                description: "Vui lòng đăng nhập để thêm bài hát vào danh sách yêu thích.",
                variant: "destructive",
            })
            return false
        }

        try {
            await postmanApi.music.likeSong(song.id.toString())

            // Cập nhật state và cache
            const updatedFavorites = [...favoriteSongs, song]
            setFavoriteSongs(updatedFavorites)
            localStorage.setItem('favoriteSongs', JSON.stringify(updatedFavorites))

            toast({
                title: "Đã thêm vào yêu thích",
                description: `Bài hát "${song.title}" đã được thêm vào danh sách yêu thích.`,
            })

            return true
        } catch (error) {
            console.error('Lỗi khi thêm bài hát vào yêu thích:', error)
            toast({
                title: "Lỗi",
                description: "Không thể thêm bài hát vào yêu thích. Vui lòng thử lại sau.",
                variant: "destructive",
            })
            return false
        }
    }, [isAuthenticated, favoriteSongs])

    // Xóa bài hát khỏi danh sách yêu thích
    const removeFromFavorites = useCallback(async (song: SongType) => {
        if (!isAuthenticated) return false

        try {
            await postmanApi.music.unlikeSong(song.id.toString())

            // Cập nhật state và cache
            const updatedFavorites = favoriteSongs.filter(s => s.id !== song.id)
            setFavoriteSongs(updatedFavorites)
            localStorage.setItem('favoriteSongs', JSON.stringify(updatedFavorites))

            toast({
                title: "Đã xóa khỏi yêu thích",
                description: `Bài hát "${song.title}" đã được xóa khỏi danh sách yêu thích.`,
            })

            return true
        } catch (error) {
            console.error('Lỗi khi xóa bài hát khỏi yêu thích:', error)
            toast({
                title: "Lỗi",
                description: "Không thể xóa bài hát khỏi yêu thích. Vui lòng thử lại sau.",
                variant: "destructive",
            })
            return false
        }
    }, [isAuthenticated, favoriteSongs])

    // Thay đổi trạng thái yêu thích (toggle)
    const toggleFavorite = useCallback(async (song: SongType) => {
        if (!isAuthenticated) {
            toast({
                title: "Yêu cầu đăng nhập",
                description: "Vui lòng đăng nhập để thao tác với danh sách yêu thích.",
                variant: "destructive",
            })
            return false
        }

        try {
            const response = await postmanApi.music.likeSong(song.id.toString())
            const result = response.status === "liked"

            // Cập nhật state và cache dựa trên kết quả từ API
            let updatedFavorites
            if (result) {
                // Đã thêm vào yêu thích
                updatedFavorites = [...favoriteSongs, song]
                toast({
                    title: "Đã thêm vào yêu thích",
                    description: `Bài hát "${song.title}" đã được thêm vào danh sách yêu thích.`,
                })
            } else {
                // Đã xóa khỏi yêu thích
                updatedFavorites = favoriteSongs.filter(s => s.id !== song.id)
                toast({
                    title: "Đã xóa khỏi yêu thích",
                    description: `Bài hát "${song.title}" đã được xóa khỏi danh sách yêu thích.`,
                })
            }

            setFavoriteSongs(updatedFavorites)
            localStorage.setItem('favoriteSongs', JSON.stringify(updatedFavorites))

            return result
        } catch (error) {
            console.error('Lỗi khi thao tác với yêu thích:', error)
            toast({
                title: "Lỗi",
                description: "Không thể thực hiện thao tác. Vui lòng thử lại sau.",
                variant: "destructive",
            })
            return false
        }
    }, [isAuthenticated, favoriteSongs])

    // Memoize context value để tránh re-render không cần thiết
    const contextValue = useMemo(() => ({
        favoriteSongs,
        isLoading,
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        refreshFavorites
    }), [
        favoriteSongs,
        isLoading,
        isFavorite,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        refreshFavorites
    ])

    return (
        <FavoriteContext.Provider value={contextValue}>
            {children}
        </FavoriteContext.Provider>
    )
}

// Hook để dễ dàng sử dụng context
export function useFavorite() {
    const context = useContext(FavoriteContext)

    if (context === undefined) {
        throw new Error('useFavorite phải được sử dụng trong FavoriteProvider')
    }

    return context
} 