"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import postmanApi from "@/lib/api/postman";

// Giới hạn bài hát trong playlist
const MAX_SONGS_PER_PLAYLIST = 1000;

interface PlaylistType {
    id: string | number;
    name: string;
    cover_image: string | null;
    songs_count: number;
}

interface AddToPlaylistModalProps {
    songId: string;
    songTitle: string;
}

export default function AddToPlaylistModal({
    songId,
    songTitle,
}: AddToPlaylistModalProps) {
    const [playlists, setPlaylists] = useState<PlaylistType[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingToPlaylist, setAddingToPlaylist] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            fetchUserPlaylists();
        }
    }, [open]);

    const fetchUserPlaylists = async () => {
        try {
            setLoading(true);
            const response = await postmanApi.music.getPlaylists();
            // Đảm bảo playlists luôn là mảng dù response có định dạng như thế nào
            if (response) {
                // Kiểm tra xem response có thuộc tính results không
                if (Array.isArray(response.results)) {
                    setPlaylists(response.results);
                }
                // Kiểm tra xem response có phải là mảng không
                else if (Array.isArray(response)) {
                    setPlaylists(response);
                }
                // Trường hợp không phải mảng cũng không có thuộc tính results
                else {
                    console.error("Định dạng response không đúng:", response);
                    setPlaylists([]); // Thiết lập mảng rỗng để tránh lỗi
                }
            } else {
                // Nếu response là undefined hoặc null
                setPlaylists([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách playlist:", error);
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách playlist",
                variant: "destructive",
            });
            // Đảm bảo nếu có lỗi vẫn set playlists là mảng rỗng
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToPlaylist = async (playlistId: string, songCount: number) => {
        // Kiểm tra tính hợp lệ của playlistId và songId
        if (!playlistId || !songId) {
            toast({
                title: "Lỗi",
                description: "Thông tin playlist hoặc bài hát không hợp lệ",
                variant: "destructive",
            });
            return;
        }

        // Kiểm tra giới hạn bài hát
        if (songCount >= MAX_SONGS_PER_PLAYLIST) {
            toast({
                title: "Đã đạt giới hạn",
                description: `Playlist đã đạt giới hạn tối đa ${MAX_SONGS_PER_PLAYLIST} bài hát.`,
                variant: "destructive",
            });
            return;
        }

        try {
            setAddingToPlaylist(playlistId);
            await postmanApi.music.addSongToPlaylist(playlistId, songId);

            // Cập nhật số lượng bài hát trong danh sách playlist
            setPlaylists(prevPlaylists => {
                if (!Array.isArray(prevPlaylists)) return [];

                return prevPlaylists.map(playlist =>
                    playlist && playlist.id && playlist.id.toString() === playlistId
                        ? { ...playlist, songs_count: (playlist.songs_count || 0) + 1 }
                        : playlist
                );
            });

            toast({
                title: "Thành công",
                description: `Đã thêm "${songTitle}" vào playlist`,
            });
        } catch (error: any) {
            if (error.status === 400 && error.data?.detail?.includes("already exists")) {
                toast({
                    title: "Thông báo",
                    description: "Bài hát đã có trong playlist này",
                });
            } else {
                console.error("Lỗi khi thêm bài hát vào playlist:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể thêm bài hát vào playlist",
                    variant: "destructive",
                });
            }
        } finally {
            setAddingToPlaylist(null);
        }
    };

    const handleCreatePlaylist = () => {
        setOpen(false);
        window.location.href = "/create-playlist";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    <span>Thêm vào playlist</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Thêm vào playlist</DialogTitle>
                    <DialogDescription>
                        Chọn playlist để thêm bài hát "{songTitle}"
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[60vh] overflow-y-auto pr-1 py-4">
                    {loading ? (
                        // Loading state
                        Array(4)
                            .fill(0)
                            .map((_, i) => (
                                <div key={`skeleton-${i}`} className="flex items-center p-3 mb-2">
                                    <Skeleton className="h-10 w-10 rounded" />
                                    <div className="ml-3">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16 mt-1" />
                                    </div>
                                </div>
                            ))
                    ) : Array.isArray(playlists) && playlists.length > 0 ? (
                        <div className="grid gap-2">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist?.id || Math.random()}
                                    className="flex items-center justify-between p-3 rounded-md hover:bg-zinc-800 cursor-pointer group"
                                    onClick={() => {
                                        if (!playlist || !playlist.id) {
                                            toast({
                                                title: "Lỗi",
                                                description: "Thông tin playlist không hợp lệ",
                                                variant: "destructive",
                                            });
                                            return;
                                        }
                                        handleAddToPlaylist(String(playlist.id), playlist.songs_count || 0);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 bg-zinc-900 rounded overflow-hidden relative flex-shrink-0">
                                            {playlist?.cover_image ? (
                                                <img
                                                    src={playlist.cover_image}
                                                    alt={playlist.name || "Playlist"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-zinc-600">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-3">
                                            <div className="font-medium">{playlist?.name || "Playlist không tên"}</div>
                                            <div className="text-xs text-zinc-400">
                                                {playlist?.songs_count || 0} bài hát
                                                {(playlist?.songs_count || 0) >= MAX_SONGS_PER_PLAYLIST && (
                                                    <span className="text-red-500 ml-1">(Đã đạt giới hạn)</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        {addingToPlaylist === String(playlist?.id) ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (playlist?.songs_count || 0) >= MAX_SONGS_PER_PLAYLIST ? (
                                            <span className="text-xs text-red-500">Đầy</span>
                                        ) : (
                                            <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-zinc-500 mb-4">Bạn chưa có playlist nào</p>
                            <Button onClick={handleCreatePlaylist}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo playlist mới
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-2 border-t border-zinc-800">
                    <Button variant="outline" onClick={handleCreatePlaylist}>
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo playlist mới
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 