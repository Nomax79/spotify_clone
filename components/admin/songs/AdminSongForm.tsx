"use client";

import { useEffect, useState } from "react";
import { AdminSong } from "@/lib/api/services/AdminSongService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

interface AdminSongFormProps {
    song?: AdminSong;
    artists: { id: number; name: string }[];
    genres: { id: number; name: string }[];
    albums: { id: number; title: string }[];
    isLoading: boolean;
    onSubmit: (formData: FormData) => Promise<void>;
    onCancel: () => void;
}

export default function AdminSongForm({
    song,
    artists,
    genres,
    albums,
    isLoading,
    onSubmit,
    onCancel
}: AdminSongFormProps) {
    const isEditMode = !!song;
    const [title, setTitle] = useState("");
    const [artistId, setArtistId] = useState<number | null>(null);
    const [albumId, setAlbumId] = useState<number | null>(null);
    const [genreId, setGenreId] = useState<number | null>(null);
    const [duration, setDuration] = useState<number | "">(0);
    const [lyrics, setLyrics] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [isApproved, setIsApproved] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverImage, setCoverImage] = useState<File | null>(null);

    // Thêm preview cho ảnh và file âm thanh
    const [audioPreview, setAudioPreview] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (song) {
            setTitle(song.title);
            setArtistId(song.artist.id);
            setAlbumId(song.album?.id || null);
            setGenreId(song.genre?.id || null);
            setDuration(song.duration || 0);
            setLyrics(song.lyrics || "");
            setReleaseDate(song.release_date || "");
            setIsApproved(song.is_approved);

            if (song.audio_file) {
                setAudioPreview(song.audio_file);
            }

            if (song.cover_image) {
                setImagePreview(song.cover_image);
            }
        }
    }, [song]);

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAudioFile(file);

        if (file) {
            const url = URL.createObjectURL(file);
            setAudioPreview(url);

            // Tự động trích xuất thời lượng bài hát nếu không có
            if (!duration && typeof Audio !== 'undefined') {
                const audio = new Audio(url);
                audio.onloadedmetadata = () => {
                    setDuration(Math.floor(audio.duration));
                };
            }
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setCoverImage(file);

        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !artistId) {
            alert("Vui lòng điền đầy đủ thông tin bắt buộc (tên bài hát, nghệ sĩ)");
            return;
        }

        if (!isEditMode && !audioFile) {
            alert("Vui lòng tải lên file nhạc");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("artist_id", artistId.toString());

        if (albumId) formData.append("album_id", albumId.toString());
        if (genreId) formData.append("genre_id", genreId.toString());
        if (duration) formData.append("duration", duration.toString());
        if (lyrics) formData.append("lyrics", lyrics);
        if (releaseDate) formData.append("release_date", releaseDate);
        formData.append("is_approved", isApproved.toString());

        if (audioFile) formData.append("audio_file", audioFile);
        if (coverImage) formData.append("cover_image", coverImage);

        await onSubmit(formData);
    };

    const clearAudioFile = () => {
        setAudioFile(null);
        if (audioPreview && !song?.audio_file) {
            URL.revokeObjectURL(audioPreview);
        }
        setAudioPreview(song?.audio_file || null);
    };

    const clearCoverImage = () => {
        setCoverImage(null);
        if (imagePreview && !song?.cover_image) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(song?.cover_image || null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="title">Tên bài hát <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white mt-1"
                            placeholder="Nhập tên bài hát"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="artist">Nghệ sĩ <span className="text-red-500">*</span></Label>
                        <Select value={artistId?.toString()} onValueChange={(value) => setArtistId(parseInt(value))}>
                            <SelectTrigger id="artist" className="bg-zinc-800 border-zinc-700 text-white mt-1">
                                <SelectValue placeholder="Chọn nghệ sĩ" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                {artists.map((artist) => (
                                    <SelectItem key={artist.id} value={artist.id.toString()}>
                                        {artist.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="album">Album</Label>
                        <Select value={albumId?.toString()} onValueChange={(value) => setAlbumId(parseInt(value))}>
                            <SelectTrigger id="album" className="bg-zinc-800 border-zinc-700 text-white mt-1">
                                <SelectValue placeholder="Chọn album" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                {albums.map((album) => (
                                    <SelectItem key={album.id} value={album.id.toString()}>
                                        {album.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="genre">Thể loại</Label>
                        <Select value={genreId?.toString()} onValueChange={(value) => setGenreId(parseInt(value))}>
                            <SelectTrigger id="genre" className="bg-zinc-800 border-zinc-700 text-white mt-1">
                                <SelectValue placeholder="Chọn thể loại" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                {genres.map((genre) => (
                                    <SelectItem key={genre.id} value={genre.id.toString()}>
                                        {genre.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="duration">Thời lượng (giây)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : "")}
                            className="bg-zinc-800 border-zinc-700 text-white mt-1"
                            placeholder="Thời lượng bài hát"
                        />
                    </div>

                    <div>
                        <Label htmlFor="release_date">Ngày phát hành</Label>
                        <Input
                            id="release_date"
                            type="date"
                            value={releaseDate}
                            onChange={(e) => setReleaseDate(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white mt-1"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_approved"
                            type="checkbox"
                            checked={isApproved}
                            onChange={(e) => setIsApproved(e.target.checked)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="is_approved">Phê duyệt</Label>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="audio_file">
                            File nhạc {!isEditMode && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="mt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Input
                                    id="audio_file"
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleAudioChange}
                                    className="bg-zinc-800 border-zinc-700 text-white file:border-0 file:bg-zinc-700 file:text-zinc-300 file:rounded-md"
                                />
                                {audioFile && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearAudioFile}
                                        className="h-10 w-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {audioPreview && (
                                <audio controls className="w-full mt-2 h-10">
                                    <source src={audioPreview} type="audio/mpeg" />
                                </audio>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="cover_image">Ảnh bìa</Label>
                        <div className="mt-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="bg-zinc-800 border-zinc-700 text-white file:border-0 file:bg-zinc-700 file:text-zinc-300 file:rounded-md"
                                />
                                {coverImage && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearCoverImage}
                                        className="h-10 w-10"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            {imagePreview && (
                                <div className="relative h-40 w-40 mt-2 rounded-md overflow-hidden">
                                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="lyrics">Lời bài hát</Label>
                        <Textarea
                            id="lyrics"
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-white mt-1 h-40"
                            placeholder="Nhập lời bài hát"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? "Đang xử lý..." : isEditMode ? "Cập nhật" : "Thêm mới"}
                </Button>
            </div>
        </form>
    );
} 