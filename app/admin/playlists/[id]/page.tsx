"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    ChevronLeft,
    ListMusic,
    Users,
    Clock,
    Pencil,
    Trash,
    Save,
    UserPlus,
    History,
    MoreHorizontal,
    RotateCcw,
} from "lucide-react"
import { api } from "@/lib/api"
import { formatDistanceToNow, format } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

export default function PlaylistDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [playlist, setPlaylist] = useState<any>(null)
    const [collaborators, setCollaborators] = useState<any[]>([])
    const [editHistory, setEditHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [editedPlaylist, setEditedPlaylist] = useState<any>({})
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showAddCollaboratorDialog, setShowAddCollaboratorDialog] = useState(false)
    const [newCollaborator, setNewCollaborator] = useState({ user: "", role: "EDITOR" })
    const [showRestoreDialog, setShowRestoreDialog] = useState(false)
    const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null)

    const playlistId = parseInt(params.id, 10)

    useEffect(() => {
        const fetchPlaylistDetails = async () => {
            try {
                setLoading(true)
                const playlistData = await api.admin.getCollaborativePlaylistDetail(playlistId)
                setPlaylist(playlistData)
                setEditedPlaylist({
                    name: playlistData.name,
                    description: playlistData.description,
                    is_public: playlistData.is_public
                })

                // Lấy danh sách người cộng tác
                const collaboratorsData = await api.admin.getPlaylistCollaborators(playlistId)
                setCollaborators(collaboratorsData || [])

                // Lấy lịch sử chỉnh sửa
                const historyData = await api.admin.getPlaylistEditHistory(playlistId)
                setEditHistory(historyData || [])
            } catch (error) {
                console.error("Error fetching playlist details:", error)
                toast.error("Lỗi khi tải thông tin playlist")
            } finally {
                setLoading(false)
            }
        }

        if (playlistId) {
            fetchPlaylistDetails()
        }
    }, [playlistId])

    const handleSaveChanges = async () => {
        try {
            const updatedPlaylist = await api.admin.updateCollaborativePlaylist(playlistId, editedPlaylist)
            setPlaylist({ ...playlist, ...updatedPlaylist })
            setEditing(false)
            toast.success("Cập nhật playlist thành công")
        } catch (error) {
            console.error("Error updating playlist:", error)
            toast.error("Lỗi khi cập nhật playlist")
        }
    }

    const handleDeletePlaylist = async () => {
        try {
            await api.admin.deleteCollaborativePlaylist(playlistId)
            setShowDeleteDialog(false)
            toast.success("Xóa playlist thành công")
            router.push("/admin/playlists")
        } catch (error) {
            console.error("Error deleting playlist:", error)
            toast.error("Lỗi khi xóa playlist")
        }
    }

    const handleAddCollaborator = async () => {
        try {
            if (!newCollaborator.user) {
                toast.error("Vui lòng nhập ID người dùng")
                return
            }

            const userId = parseInt(newCollaborator.user, 10)
            if (isNaN(userId)) {
                toast.error("ID người dùng không hợp lệ")
                return
            }

            const response = await api.admin.addPlaylistCollaborator(playlistId, {
                user: userId,
                role: newCollaborator.role
            })

            // Cập nhật danh sách người cộng tác
            const collaboratorsData = await api.admin.getPlaylistCollaborators(playlistId)
            setCollaborators(collaboratorsData || [])

            setShowAddCollaboratorDialog(false)
            setNewCollaborator({ user: "", role: "EDITOR" })
            toast.success("Thêm người cộng tác thành công")
        } catch (error) {
            console.error("Error adding collaborator:", error)
            toast.error("Lỗi khi thêm người cộng tác")
        }
    }

    const handleRemoveCollaborator = async (userId: number) => {
        try {
            await api.admin.removePlaylistCollaborator(playlistId, userId)

            // Cập nhật danh sách người cộng tác
            setCollaborators(collaborators.filter(c => c.user.id !== userId))
            toast.success("Xóa người cộng tác thành công")
        } catch (error) {
            console.error("Error removing collaborator:", error)
            toast.error("Lỗi khi xóa người cộng tác")
        }
    }

    const handleChangeCollaboratorRole = async (userId: number, newRole: string) => {
        try {
            await api.admin.changeCollaboratorRole(playlistId, userId, {
                role: newRole
            })

            // Cập nhật danh sách người cộng tác
            setCollaborators(collaborators.map(c => {
                if (c.user.id === userId) {
                    return { ...c, role: newRole }
                }
                return c
            }))
            toast.success("Thay đổi vai trò thành công")
        } catch (error) {
            console.error("Error changing collaborator role:", error)
            toast.error("Lỗi khi thay đổi vai trò")
        }
    }

    const handleRestorePlaylist = async () => {
        if (!selectedHistoryId) return

        try {
            await api.admin.restorePlaylist(playlistId, selectedHistoryId)

            // Cập nhật thông tin playlist
            const playlistData = await api.admin.getCollaborativePlaylistDetail(playlistId)
            setPlaylist(playlistData)
            setEditedPlaylist({
                name: playlistData.name,
                description: playlistData.description,
                is_public: playlistData.is_public
            })

            setShowRestoreDialog(false)
            setSelectedHistoryId(null)
            toast.success("Khôi phục playlist thành công")
        } catch (error) {
            console.error("Error restoring playlist:", error)
            toast.error("Lỗi khi khôi phục playlist")
        }
    }

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-green-500 rounded-full"></div>
            </div>
        )
    }

    if (!playlist) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Quay lại
                </Button>
                <div className="text-center py-12">
                    <ListMusic className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
                    <h2 className="text-2xl font-semibold mb-2">Không tìm thấy playlist</h2>
                    <p className="text-zinc-400">Playlist không tồn tại hoặc đã bị xóa</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold ml-4">Chi tiết Playlist Cộng tác</h1>
                </div>

                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <Button onClick={() => setEditing(false)} variant="outline">
                                Hủy
                            </Button>
                            <Button onClick={handleSaveChanges}>
                                <Save className="mr-2 h-4 w-4" />
                                Lưu thay đổi
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => setEditing(true)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Chỉnh sửa
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Xóa
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Thông tin cơ bản playlist */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                    <Card className="bg-zinc-800 border-zinc-700 text-white">
                        <div className="p-6">
                            <div className="aspect-square bg-zinc-700 rounded-md overflow-hidden mb-4 flex items-center justify-center">
                                {playlist.cover_image ? (
                                    <img
                                        src={playlist.cover_image}
                                        alt={playlist.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <ListMusic className="h-16 w-16 text-zinc-600" />
                                )}
                            </div>

                            {editing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Tên playlist</label>
                                        <Input
                                            value={editedPlaylist.name}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, name: e.target.value })}
                                            className="bg-zinc-700 border-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Mô tả</label>
                                        <Textarea
                                            value={editedPlaylist.description || ""}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, description: e.target.value })}
                                            className="bg-zinc-700 border-zinc-600 min-h-[100px]"
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_public"
                                            checked={editedPlaylist.is_public}
                                            onChange={(e) => setEditedPlaylist({ ...editedPlaylist, is_public: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label htmlFor="is_public">Công khai</label>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold mb-2">{playlist.name}</h2>
                                    <p className="text-zinc-400 mb-4">{playlist.description || "Không có mô tả"}</p>

                                    <div className="flex items-center mb-4">
                                        <Badge variant={playlist.is_public ? "default" : "outline"}>
                                            {playlist.is_public ? "Công khai" : "Riêng tư"}
                                        </Badge>
                                        <Badge variant="outline" className="ml-2">
                                            {playlist.is_collaborative ? "Cộng tác" : "Cá nhân"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Ngày tạo:</span>
                                            <span>{format(new Date(playlist.created_at), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Cập nhật lần cuối:</span>
                                            <span>{format(new Date(playlist.updated_at), 'dd/MM/yyyy HH:mm')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Người tạo:</span>
                                            <span>{playlist.user?.username || "Không rõ"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Số bài hát:</span>
                                            <span>{playlist.song_count || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Người cộng tác:</span>
                                            <span>{collaborators.length}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="collaborators" className="space-y-4">
                        <TabsList className="bg-zinc-800">
                            <TabsTrigger value="collaborators" className="data-[state=active]:bg-zinc-700">
                                Người cộng tác
                            </TabsTrigger>
                            <TabsTrigger value="history" className="data-[state=active]:bg-zinc-700">
                                Lịch sử chỉnh sửa
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="collaborators">
                            <Card className="bg-zinc-800 border-zinc-700 text-white">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Danh sách người cộng tác</CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            Các người dùng được phép chỉnh sửa playlist này
                                        </CardDescription>
                                    </div>
                                    <Button onClick={() => setShowAddCollaboratorDialog(true)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Thêm người cộng tác
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {collaborators.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-500">
                                            Không có người cộng tác nào
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {collaborators.map((collaborator) => (
                                                <div
                                                    key={collaborator.user.id}
                                                    className="flex items-center justify-between p-3 bg-zinc-700 rounded-md"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-600 flex items-center justify-center">
                                                            {collaborator.user.avatar ? (
                                                                <img
                                                                    src={collaborator.user.avatar}
                                                                    alt={collaborator.user.username}
                                                                    className="w-full h-full object-cover rounded-full"
                                                                />
                                                            ) : (
                                                                <Users className="h-5 w-5 text-zinc-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium">{collaborator.user.username}</div>
                                                            <div className="text-xs text-zinc-400">{collaborator.user.email}</div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="capitalize">
                                                            {collaborator.role.toLowerCase()}
                                                        </Badge>

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                                                                <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                                <DropdownMenuSeparator className="bg-zinc-700" />

                                                                <DropdownMenuItem
                                                                    className="cursor-pointer"
                                                                    onClick={() => handleChangeCollaboratorRole(
                                                                        collaborator.user.id,
                                                                        collaborator.role === "EDITOR" ? "VIEWER" : "EDITOR"
                                                                    )}
                                                                >
                                                                    Đổi vai trò sang {collaborator.role === "EDITOR" ? "Viewer" : "Editor"}
                                                                </DropdownMenuItem>

                                                                <DropdownMenuItem
                                                                    className="cursor-pointer text-red-500"
                                                                    onClick={() => handleRemoveCollaborator(collaborator.user.id)}
                                                                >
                                                                    Xóa người cộng tác
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            <Card className="bg-zinc-800 border-zinc-700 text-white">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <History className="h-5 w-5" />
                                        <span>Lịch sử chỉnh sửa playlist</span>
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        Các thay đổi đã được thực hiện trên playlist này
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {editHistory.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-500">
                                            Không có lịch sử chỉnh sửa
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {editHistory.map((history, index) => (
                                                <div
                                                    key={history.id}
                                                    className="p-4 bg-zinc-700 rounded-md"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-zinc-600 flex items-center justify-center">
                                                                <Clock className="h-4 w-4 text-zinc-400" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">{history.edited_by}</div>
                                                                <div className="text-xs text-zinc-400">
                                                                    {format(new Date(history.timestamp), 'dd/MM/yyyy HH:mm')}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={() => {
                                                                setSelectedHistoryId(history.id)
                                                                setShowRestoreDialog(true)
                                                            }}
                                                        >
                                                            <RotateCcw className="mr-1 h-3 w-3" />
                                                            Khôi phục
                                                        </Button>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        {history.changes.map((change: any, changeIndex: number) => (
                                                            <div key={changeIndex} className="flex items-start gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-zinc-500 mt-1.5"></div>
                                                                <div>
                                                                    <span className="text-zinc-300">{change.field}:</span>{" "}
                                                                    <span className="text-red-400">{change.old_value || "(trống)"}</span>{" "}
                                                                    <span className="text-zinc-500">→</span>{" "}
                                                                    <span className="text-green-400">{change.new_value || "(trống)"}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Dialog xóa playlist */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa playlist</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Bạn có chắc chắn muốn xóa playlist này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-4 bg-zinc-700 rounded-md my-4">
                        <h3 className="font-medium mb-1">{playlist.name}</h3>
                        <p className="text-sm text-zinc-400">Ngày tạo: {format(new Date(playlist.created_at), 'dd/MM/yyyy')}</p>
                        <p className="text-sm text-zinc-400">Người tạo: {playlist.user?.username || "Không rõ"}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDeletePlaylist}>
                            Xác nhận xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog thêm người cộng tác */}
            <Dialog open={showAddCollaboratorDialog} onOpenChange={setShowAddCollaboratorDialog}>
                <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Thêm người cộng tác</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Thêm người dùng vào playlist cộng tác này
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">ID người dùng</label>
                            <Input
                                value={newCollaborator.user}
                                onChange={(e) => setNewCollaborator({ ...newCollaborator, user: e.target.value })}
                                placeholder="Nhập ID người dùng"
                                className="bg-zinc-700 border-zinc-600"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-1 block">Vai trò</label>
                            <select
                                value={newCollaborator.role}
                                onChange={(e) => setNewCollaborator({ ...newCollaborator, role: e.target.value })}
                                className="w-full bg-zinc-700 border-zinc-600 rounded-md p-2"
                            >
                                <option value="EDITOR">Editor (Có thể chỉnh sửa)</option>
                                <option value="VIEWER">Viewer (Chỉ xem)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddCollaboratorDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleAddCollaborator}>
                            Thêm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog khôi phục playlist */}
            <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
                <DialogContent className="bg-zinc-800 border-zinc-700 text-white">
                    <DialogHeader>
                        <DialogTitle>Khôi phục phiên bản trước</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Bạn có chắc chắn muốn khôi phục playlist về phiên bản này?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm">Việc này sẽ hoàn tác tất cả các thay đổi sau phiên bản được chọn.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleRestorePlaylist}>
                            Xác nhận khôi phục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 