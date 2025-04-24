"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Search, Music, Play, Pause } from "lucide-react"
import { musicApi } from "@/lib/api"
import type { Song } from "@/types"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminSongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddSongOpen, setIsAddSongOpen] = useState(false)
  const [isEditSongOpen, setIsEditSongOpen] = useState(false)
  const [isDeleteSongOpen, setIsDeleteSongOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [playingSong, setPlayingSong] = useState<string | null>(null)
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    genre: "",
    duration: 0,
    file_path: "",
    cover_image: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [songsData, genresData] = await Promise.all([musicApi.getSongs(), musicApi.getGenres()])
        setSongs(songsData as Song[])
        setGenres(genresData as { id: string; name: string }[])
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to mock data
        setSongs([
          {
            id: "1",
            title: "Chúng Ta Của Hiện Tại",
            artist: "Sơn Tùng M-TP",
            album: "Chúng Ta Của Hiện Tại (Single)",
            genre: "V-Pop",
            duration: 289,
            file_path: "https://example.com/song1.mp3",
            cover_image: "/placeholder.svg?height=60&width=60&text=ST",
            release_date: "2020-12-20",
            created_at: new Date().toISOString(),
            play_count: 15000000,
          },
          {
            id: "2",
            title: "Có Chắc Yêu Là Đây",
            artist: "Sơn Tùng M-TP",
            album: "Có Chắc Yêu Là Đây (Single)",
            genre: "V-Pop",
            duration: 218,
            file_path: "https://example.com/song2.mp3",
            cover_image: "/placeholder.svg?height=60&width=60&text=ST",
            release_date: "2020-07-05",
            created_at: new Date().toISOString(),
            play_count: 12000000,
          },
          {
            id: "3",
            title: "Chạy Ngay Đi",
            artist: "Sơn Tùng M-TP",
            album: "Chạy Ngay Đi (Single)",
            genre: "V-Pop",
            duration: 248,
            file_path: "https://example.com/song3.mp3",
            cover_image: "/placeholder.svg?height=60&width=60&text=ST",
            release_date: "2018-05-12",
            created_at: new Date().toISOString(),
            play_count: 18000000,
          },
        ])
        setGenres([
          { id: "1", name: "V-Pop" },
          { id: "2", name: "K-Pop" },
          { id: "3", name: "Pop" },
          { id: "4", name: "Rock" },
          { id: "5", name: "Hip-Hop" },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddSong = async () => {
    try {
      // Validate form
      if (!newSong.title || !newSong.artist || !newSong.file_path) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc")
        return
      }

      // Call API to create song
      const createdSong = await musicApi.createSong(newSong)

      // Update songs list
      setSongs([...songs, createdSong as Song])

      // Reset form and close dialog
      setNewSong({
        title: "",
        artist: "",
        album: "",
        genre: "",
        duration: 0,
        file_path: "",
        cover_image: "",
      })
      setIsAddSongOpen(false)
    } catch (error) {
      console.error("Error creating song:", error)
      alert("Có lỗi xảy ra khi tạo bài hát")
    }
  }

  const handleEditSong = async () => {
    if (!selectedSong) return

    try {
      // Call API to update song
      const updatedSong = await musicApi.updateSong(selectedSong.id, selectedSong)

      // Update songs list
      setSongs(songs.map((song) => (song.id === selectedSong.id ? (updatedSong as Song) : song)))

      // Reset and close dialog
      setSelectedSong(null)
      setIsEditSongOpen(false)
    } catch (error) {
      console.error("Error updating song:", error)
      alert("Có lỗi xảy ra khi cập nhật bài hát")
    }
  }

  const handleDeleteSong = async () => {
    if (!selectedSong) return

    try {
      // Call API to delete song
      await musicApi.deleteSong(selectedSong.id)

      // Update songs list
      setSongs(songs.filter((song) => song.id !== selectedSong.id))

      // Reset and close dialog
      setSelectedSong(null)
      setIsDeleteSongOpen(false)
    } catch (error) {
      console.error("Error deleting song:", error)
      alert("Có lỗi xảy ra khi xóa bài hát")
    }
  }

  const togglePlaySong = (songId: string) => {
    if (playingSong === songId) {
      setPlayingSong(null)
    } else {
      setPlayingSong(songId)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (song.album && song.album.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (song.genre && song.genre.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý bài hát</h1>
        <Button onClick={() => setIsAddSongOpen(true)}>
          <Music className="h-4 w-4 mr-2" />
          Thêm bài hát
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Tìm kiếm bài hát..."
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-zinc-800 rounded-md border border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-zinc-700/50">
              <TableHead className="text-zinc-400 w-12"></TableHead>
              <TableHead className="text-zinc-400">Bài hát</TableHead>
              <TableHead className="text-zinc-400">Album</TableHead>
              <TableHead className="text-zinc-400">Thể loại</TableHead>
              <TableHead className="text-zinc-400">Thời lượng</TableHead>
              <TableHead className="text-zinc-400">Lượt nghe</TableHead>
              <TableHead className="text-zinc-400 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredSongs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-zinc-500">
                  Không tìm thấy bài hát nào
                </TableCell>
              </TableRow>
            ) : (
              filteredSongs.map((song) => (
                <TableRow key={song.id} className="hover:bg-zinc-700/50">
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={() => togglePlaySong(song.id)}
                    >
                      {playingSong === song.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Image
                        src={song.cover_image || "/placeholder.svg?height=40&width=40"}
                        width={40}
                        height={40}
                        alt={song.title}
                        className="rounded"
                      />
                      <div>
                        <div className="font-medium">{song.title}</div>
                        <div className="text-xs text-zinc-400">{song.artist}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{song.album || "-"}</TableCell>
                  <TableCell>{song.genre || "-"}</TableCell>
                  <TableCell>{formatDuration(song.duration)}</TableCell>
                  <TableCell>{song.play_count?.toLocaleString() || "0"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedSong(song)
                          setIsEditSongOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => {
                          setSelectedSong(song)
                          setIsDeleteSongOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Song Dialog */}
      <Dialog open={isAddSongOpen} onOpenChange={setIsAddSongOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thêm bài hát mới</DialogTitle>
            <DialogDescription className="text-zinc-400">Điền thông tin để tạo bài hát mới</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Tên bài hát <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={newSong.title}
                  onChange={(e) => setNewSong({ ...newSong, title: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="artist" className="text-sm font-medium">
                  Nghệ sĩ <span className="text-red-500">*</span>
                </label>
                <Input
                  id="artist"
                  value={newSong.artist}
                  onChange={(e) => setNewSong({ ...newSong, artist: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="album" className="text-sm font-medium">
                  Album
                </label>
                <Input
                  id="album"
                  value={newSong.album}
                  onChange={(e) => setNewSong({ ...newSong, album: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="genre" className="text-sm font-medium">
                  Thể loại
                </label>
                <Select value={newSong.genre} onValueChange={(value) => setNewSong({ ...newSong, genre: value })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Chọn thể loại" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.name}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Thời lượng (giây)
                </label>
                <Input
                  id="duration"
                  type="number"
                  value={newSong.duration || ""}
                  onChange={(e) => setNewSong({ ...newSong, duration: Number.parseInt(e.target.value) || 0 })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="cover_image" className="text-sm font-medium">
                  URL ảnh bìa
                </label>
                <Input
                  id="cover_image"
                  value={newSong.cover_image}
                  onChange={(e) => setNewSong({ ...newSong, cover_image: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="file_path" className="text-sm font-medium">
                URL file nhạc <span className="text-red-500">*</span>
              </label>
              <Input
                id="file_path"
                value={newSong.file_path}
                onChange={(e) => setNewSong({ ...newSong, file_path: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="https://example.com/song.mp3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSongOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddSong}>Thêm bài hát</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Song Dialog */}
      <Dialog open={isEditSongOpen} onOpenChange={setIsEditSongOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa bài hát</DialogTitle>
            <DialogDescription className="text-zinc-400">Cập nhật thông tin bài hát</DialogDescription>
          </DialogHeader>
          {selectedSong && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_title" className="text-sm font-medium">
                    Tên bài hát
                  </label>
                  <Input
                    id="edit_title"
                    value={selectedSong.title}
                    onChange={(e) => setSelectedSong({ ...selectedSong, title: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_artist" className="text-sm font-medium">
                    Nghệ sĩ
                  </label>
                  <Input
                    id="edit_artist"
                    value={selectedSong.artist}
                    onChange={(e) => setSelectedSong({ ...selectedSong, artist: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_album" className="text-sm font-medium">
                    Album
                  </label>
                  <Input
                    id="edit_album"
                    value={selectedSong.album || ""}
                    onChange={(e) => setSelectedSong({ ...selectedSong, album: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_genre" className="text-sm font-medium">
                    Thể loại
                  </label>
                  <Select
                    value={selectedSong.genre || ""}
                    onValueChange={(value) => setSelectedSong({ ...selectedSong, genre: value })}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Chọn thể loại" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit_duration" className="text-sm font-medium">
                    Thời lượng (giây)
                  </label>
                  <Input
                    id="edit_duration"
                    type="number"
                    value={selectedSong.duration || ""}
                    onChange={(e) =>
                      setSelectedSong({ ...selectedSong, duration: Number.parseInt(e.target.value) || 0 })
                    }
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit_cover_image" className="text-sm font-medium">
                    URL ảnh bìa
                  </label>
                  <Input
                    id="edit_cover_image"
                    value={selectedSong.cover_image || ""}
                    onChange={(e) => setSelectedSong({ ...selectedSong, cover_image: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit_file_path" className="text-sm font-medium">
                  URL file nhạc
                </label>
                <Input
                  id="edit_file_path"
                  value={selectedSong.file_path}
                  onChange={(e) => setSelectedSong({ ...selectedSong, file_path: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSongOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleEditSong}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Song Dialog */}
      <Dialog open={isDeleteSongOpen} onOpenChange={setIsDeleteSongOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa bài hát</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bạn có chắc chắn muốn xóa bài hát này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedSong && (
            <div className="py-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-800 rounded-md">
                <Image
                  src={selectedSong.cover_image || "/placeholder.svg?height=60&width=60"}
                  width={60}
                  height={60}
                  alt={selectedSong.title}
                  className="rounded"
                />
                <div>
                  <div className="font-medium">{selectedSong.title}</div>
                  <div className="text-sm text-zinc-400">{selectedSong.artist}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSongOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteSong}>
              Xóa bài hát
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
