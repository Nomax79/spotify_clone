"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Search, ListMusic, Users, Calendar, LayoutGrid, List } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export default function PlaylistsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Các tham số tìm kiếm
  const [searchTerm, setSearchTerm] = useState("")
  const [ownerId, setOwnerId] = useState("")
  const [collaboratorId, setCollaboratorId] = useState("")
  const [ordering, setOrdering] = useState("-created_at")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  })

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true)

        // Xây dựng tham số request
        const params: any = {
          page,
          page_size: 12
        }

        if (searchTerm) params.search = searchTerm
        if (ownerId) params.owner_id = ownerId
        if (collaboratorId) params.collaborator_id = collaboratorId
        if (ordering) params.ordering = ordering

        if (dateRange.from) {
          params.created_after = dateRange.from.toISOString().split('T')[0]
        }

        if (dateRange.to) {
          params.created_before = dateRange.to.toISOString().split('T')[0]
        }

        const response = await api.admin.getCollaborativePlaylists(params)
        setPlaylists(response.results || [])
        setTotalCount(response.count || 0)
      } catch (error) {
        console.error("Error fetching playlists:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [page, searchTerm, ownerId, collaboratorId, ordering, dateRange])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset về trang 1 khi tìm kiếm
  }

  const clearFilters = () => {
    setSearchTerm("")
    setOwnerId("")
    setCollaboratorId("")
    setOrdering("-created_at")
    setDateRange({ from: undefined, to: undefined })
    setPage(1)
  }

  const totalPages = Math.ceil(totalCount / 12)

  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => page > 1 && setPage(page - 1)}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Hiển thị các trang xung quanh trang hiện tại
            let pageToShow

            if (totalPages <= 5) {
              // Nếu tổng số trang <= 5, hiển thị tất cả
              pageToShow = i + 1
            } else if (page <= 3) {
              // Nếu đang ở gần đầu
              pageToShow = i + 1
            } else if (page >= totalPages - 2) {
              // Nếu đang ở gần cuối
              pageToShow = totalPages - 4 + i
            } else {
              // Ở giữa
              pageToShow = page - 2 + i
            }

            return (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={pageToShow === page}
                  onClick={() => setPage(pageToShow)}
                  className="cursor-pointer"
                >
                  {pageToShow}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          {totalPages > 5 && page < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          {totalPages > 5 && page < totalPages - 1 && (
            <PaginationItem>
              <PaginationLink
                onClick={() => setPage(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => page < totalPages && setPage(page + 1)}
              className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý Playlist Cộng tác</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-zinc-700" : ""}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setViewMode("list")}
            className={viewMode === "list" ? "bg-zinc-700" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bộ lọc */}
      <Card className="bg-zinc-800 border-zinc-700 text-white">
        <CardHeader>
          <CardTitle className="text-lg">Tìm kiếm và Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Tìm theo tên, mô tả..."
                    className="pl-10 bg-zinc-700 border-zinc-600"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="owner_id" className="text-xs block mb-1">Người tạo (ID)</label>
                  <Input
                    id="owner_id"
                    placeholder="ID người tạo"
                    className="bg-zinc-700 border-zinc-600"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="collaborator_id" className="text-xs block mb-1">Người cộng tác (ID)</label>
                  <Input
                    id="collaborator_id"
                    placeholder="ID người cộng tác"
                    className="bg-zinc-700 border-zinc-600"
                    value={collaboratorId}
                    onChange={(e) => setCollaboratorId(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="ordering" className="text-xs block mb-1">Sắp xếp</label>
                  <Select
                    value={ordering}
                    onValueChange={setOrdering}
                  >
                    <SelectTrigger id="ordering" className="bg-zinc-700 border-zinc-600">
                      <SelectValue placeholder="Sắp xếp" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-700 border-zinc-600">
                      <SelectItem value="name">Tên (A-Z)</SelectItem>
                      <SelectItem value="-name">Tên (Z-A)</SelectItem>
                      <SelectItem value="created_at">Cũ nhất</SelectItem>
                      <SelectItem value="-created_at">Mới nhất</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs block mb-1">Ngày tạo</label>
                  <DatePicker date={dateRange} setDate={setDateRange} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
              >
                Xóa bộ lọc
              </Button>

              <Button type="submit">Tìm kiếm</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-t-2 border-green-500 rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Hiển thị kết quả */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-zinc-400">Hiển thị {playlists.length} / {totalCount} playlist cộng tác</p>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-12 bg-zinc-800 rounded-lg">
                <ListMusic className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                <h3 className="text-xl font-medium mb-2">Không tìm thấy playlist nào</h3>
                <p className="text-zinc-400">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                      <Link
                        href={`/admin/playlists/${playlist.id}`}
                        key={playlist.id}
                        className="block group"
                      >
                        <div className="bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 transition-all hover:border-zinc-600">
                          <div className="aspect-square bg-zinc-700 relative overflow-hidden">
                            {playlist.cover_image ? (
                              <img
                                src={playlist.cover_image}
                                alt={playlist.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ListMusic className="h-16 w-16 text-zinc-600" />
                              </div>
                            )}
                          </div>

                          <div className="p-4">
                            <h3 className="font-medium truncate mb-1">{playlist.name}</h3>

                            <div className="flex items-center text-xs text-zinc-400 mb-2">
                              <Users className="h-3 w-3 mr-1" />
                              <span>
                                {playlist.collaborators ? playlist.collaborators.length : 0} người cộng tác
                              </span>
                            </div>

                            <div className="flex items-center text-xs text-zinc-400">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {formatDistanceToNow(new Date(playlist.created_at), {
                                  addSuffix: true,
                                  locale: vi
                                })}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center">
                              <div className="w-5 h-5 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden">
                                {playlist.user?.avatar ? (
                                  <img
                                    src={playlist.user.avatar}
                                    alt={playlist.user.username}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-3 h-3 m-auto text-zinc-500" />
                                )}
                              </div>
                              <span className="text-xs text-zinc-400 ml-1 truncate">
                                {playlist.user?.username || "Người dùng"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {playlists.map((playlist) => (
                      <Link
                        href={`/admin/playlists/${playlist.id}`}
                        key={playlist.id}
                        className="block"
                      >
                        <div className="bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 p-4 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-zinc-700 rounded overflow-hidden flex-shrink-0">
                              {playlist.cover_image ? (
                                <img
                                  src={playlist.cover_image}
                                  alt={playlist.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ListMusic className="h-8 w-8 text-zinc-600" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium mb-1">{playlist.name}</h3>
                              <p className="text-sm text-zinc-400 truncate mb-2">
                                {playlist.description || "Không có mô tả"}
                              </p>

                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                                <div className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  <span>
                                    {playlist.collaborators ? playlist.collaborators.length : 0} người cộng tác
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {formatDistanceToNow(new Date(playlist.created_at), {
                                      addSuffix: true,
                                      locale: vi
                                    })}
                                  </span>
                                </div>

                                <div className="flex items-center">
                                  <span className="flex items-center">
                                    <span className="text-zinc-500 mr-1">Người tạo:</span>
                                    {playlist.user?.username || "Người dùng"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <Badge
                                variant={playlist.is_collaborative ? "default" : "outline"}
                                className={playlist.is_collaborative ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : ""}
                              >
                                {playlist.is_collaborative ? "Cộng tác" : "Cá nhân"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {renderPagination()}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
