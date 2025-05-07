"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, User, Calendar, Music } from "lucide-react"
import { api } from "@/lib/api"
import Link from "next/link"

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [userActivity, setUserActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("top-listeners")

  useEffect(() => {
    const fetchUserActivity = async () => {
      try {
        setLoading(true)
        const response = await api.admin.getUserActivity()
        setUserActivity(response)
      } catch (error) {
        console.error("Error fetching user activity:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserActivity()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Trong thực tế, bạn sẽ tìm kiếm người dùng thông qua API
    console.log("Searching for:", searchTerm)
  }

  const getUserList = () => {
    if (!userActivity) return []

    switch (activeTab) {
      case "top-listeners":
        return userActivity.top_listeners || []
      case "new-users":
        return userActivity.new_users || []
      case "active-users":
        return userActivity.active_users || []
      default:
        return []
    }
  }

  const renderUserList = () => {
    const users = getUserList()

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-t-2 border-green-500 rounded-full"></div>
        </div>
      )
    }

    if (!users || users.length === 0) {
      return (
        <div className="text-center py-8 text-zinc-500">
          Không có dữ liệu người dùng để hiển thị
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {users.map((user: any) => (
          <Link href={`/admin/users/${user.id}`} key={user.id}>
            <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                  <User className="w-5 h-5 text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-medium">{user.username}</h3>
                  <p className="text-xs text-zinc-400">{user.email || "No email"}</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                {user.play_count !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Lượt nghe</p>
                    <p className="font-medium">{user.play_count}</p>
                  </div>
                )}

                {user.playlist_count !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Playlist</p>
                    <p className="font-medium">{user.playlist_count}</p>
                  </div>
                )}

                {user.recent_plays !== undefined && (
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Lượt nghe gần đây</p>
                    <p className="font-medium">{user.recent_plays}</p>
                  </div>
                )}

                <Badge variant="outline" className="ml-2">
                  {new Date(user.date_joined || user.last_login).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quản lý người dùng</h1>

        <form onSubmit={handleSearch} className="relative max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Tìm kiếm người dùng..."
            className="pl-8 bg-zinc-800 border-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>
      </div>

      <Tabs
        defaultValue="top-listeners"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="top-listeners" className="data-[state=active]:bg-zinc-700">
            Top người nghe
          </TabsTrigger>
          <TabsTrigger value="new-users" className="data-[state=active]:bg-zinc-700">
            Người dùng mới
          </TabsTrigger>
          <TabsTrigger value="active-users" className="data-[state=active]:bg-zinc-700">
            Người dùng hoạt động
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top-listeners" className="space-y-4">
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                <span>Top người nghe nhạc</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Danh sách người dùng nghe nhạc nhiều nhất
              </CardDescription>
            </CardHeader>
            <CardContent>{renderUserList()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-users" className="space-y-4">
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Người dùng mới</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Danh sách người dùng đăng ký gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>{renderUserList()}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active-users" className="space-y-4">
          <Card className="bg-zinc-800 border-zinc-700 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span>Người dùng hoạt động</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Danh sách người dùng hoạt động nhiều gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>{renderUserList()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
