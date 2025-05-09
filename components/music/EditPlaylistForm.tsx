"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Upload, Image as ImageIcon, AlertCircle } from "lucide-react"
import postmanApi from "@/lib/api/postman"

// Kích thước file ảnh tối đa (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

interface EditPlaylistFormProps {
    playlistId: string;
    onSuccess?: () => void;
}

export function EditPlaylistForm({ playlistId, onSuccess }: EditPlaylistFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [imageError, setImageError] = useState<string | null>(null)
    const [initialData, setInitialData] = useState<any>(null)

    // Lấy thông tin playlist hiện tại
    useEffect(() => {
        async function fetchPlaylistDetails() {
            try {
                const response = await postmanApi.music.getPlaylist(playlistId)
                setInitialData(response)
                setName(response.name)
                setDescription(response.description || "")
                setIsPublic(response.is_public)
                if (response.cover_image) {
                    setCoverImagePreview(response.cover_image)
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin playlist:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể lấy thông tin playlist. Vui lòng thử lại sau.",
                    variant: "destructive",
                })
            }
        }

        fetchPlaylistDetails()
    }, [playlistId, toast])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Kiểm tra kích thước ảnh
            if (file.size > MAX_IMAGE_SIZE) {
                setImageError(`Kích thước ảnh quá lớn. Tối đa 5MB (ảnh hiện tại: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`)
                return
            }

            // Kiểm tra định dạng ảnh
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
            if (!validTypes.includes(file.type)) {
                setImageError("Định dạng ảnh không hợp lệ. Chỉ hỗ trợ JPEG, JPG và PNG.")
                return
            }

            // Xóa thông báo lỗi nếu có
            setImageError(null)
            setCoverImage(file)

            // Tạo URL xem trước cho hình ảnh
            const reader = new FileReader()
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setCoverImagePreview(event.target.result)
                }
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập tên playlist",
                variant: "destructive",
            })
            return
        }

        if (imageError) {
            toast({
                title: "Lỗi ảnh bìa",
                description: imageError,
                variant: "destructive",
            })
            return
        }

        try {
            setLoading(true)

            // Tạo FormData để gửi dữ liệu
            const formData = new FormData()
            formData.append('name', name)
            if (description.trim()) {
                formData.append('description', description)
            }
            formData.append('is_public', isPublic.toString())

            // Chỉ gửi ảnh nếu có thay đổi
            if (coverImage) {
                formData.append('cover_image', coverImage)
            }

            // Sử dụng postmanApi thay vì playlistService
            await postmanApi.music.updatePlaylist(playlistId, formData)

            toast({
                title: "Thành công",
                description: "Đã cập nhật playlist",
            })

            // Gọi callback nếu có
            if (onSuccess) {
                onSuccess()
            }

            // Chuyển hướng đến trang playlist
            router.push(`/playlist/${playlistId}`)
        } catch (error: any) {
            console.error("Lỗi khi cập nhật playlist:", error)

            // Xử lý các lỗi cụ thể
            let errorMessage = "Không thể cập nhật playlist. Vui lòng thử lại sau."
            if (error.response?.status === 413) {
                errorMessage = "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 5MB."
            } else if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail
            }

            toast({
                title: "Lỗi",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="mr-4"
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-3xl font-bold">Chỉnh sửa Playlist</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                        <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden relative">
                            {coverImagePreview ? (
                                <Image
                                    src={coverImagePreview}
                                    alt="Ảnh bìa"
                                    className="object-cover"
                                    fill
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                    <ImageIcon className="h-20 w-20 mb-2" />
                                    <span>Chọn ảnh bìa</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="cover-image" className="cursor-pointer">
                                <div className="flex items-center justify-center py-2 px-4 border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 rounded-md text-center">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Tải ảnh lên
                                </div>
                                <Input
                                    id="cover-image"
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </Label>
                            <p className="mt-2 text-xs text-zinc-400">
                                Định dạng: PNG, JPG. Tối đa: 5MB
                            </p>
                            {imageError && (
                                <p className="mt-1 text-xs text-red-500">{imageError}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên playlist</Label>
                            <Input
                                id="name"
                                placeholder="Playlist của tôi"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả (không bắt buộc)</Label>
                            <Textarea
                                id="description"
                                placeholder="Mô tả về playlist này..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-4">
                            <Switch
                                id="is-public"
                                checked={isPublic}
                                onCheckedChange={setIsPublic}
                            />
                            <Label htmlFor="is-public">Công khai</Label>
                        </div>

                        <div className="text-sm text-zinc-400">
                            {isPublic ? (
                                "Playlist sẽ hiển thị với người dùng khác"
                            ) : (
                                "Chỉ bạn mới có thể xem playlist này"
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="mr-2"
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-black"
                        disabled={loading}
                    >
                        {loading ? "Đang cập nhật..." : "Lưu thay đổi"}
                    </Button>
                </div>
            </form>
        </div>
    )
} 