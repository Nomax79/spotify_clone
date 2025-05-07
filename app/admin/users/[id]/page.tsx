"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
    User,
    Music,
    Calendar,
    Clock,
    ChevronLeft,
    LineChart,
    ListMusic,
    Heart
} from "lucide-react"
import { api } from "@/lib/api"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface UserActivityData {
    user_info: {
        username: string;
        email: string;
        date_joined: string;
        last_login: string;
    };
    play_history?: Array<{
        song_title: string;
        song_artist: string;
        played_at: string;
    }>;
    favorite_genres?: Record<string, number>;
    playlists?: Array<any>;
    favorite_songs?: Array<any>;
    daily_activity?: Record<string, number>;
}

export default function UserDetailPage() {
    const params = useParams<{ id: string }>()
    const router = useRouter()
    const [userDetail, setUserDetail] = useState<UserActivityData | null>(null)
    const [loading, setLoading] = useState(true)
    const userId = params.id

    useEffect(() => {
        const fetchUserDetail = async () => {
            try {
                setLoading(true)
                const response = await api.admin.getUserActivity(parseInt(userId, 10))
                setUserDetail(response)
            } catch (error) {
                console.error("Error fetching user details:", error)
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            fetchUserDetail()
        }
    }, [userId])

    // Chuyển đổi dữ liệu daily_activity từ object sang array cho biểu đồ
    const dailyActivityData = userDetail?.daily_activity
        ? Object.entries(userDetail.daily_activity).map(([date, count]) => ({
            date,
            plays: count
        }))
        : []

    // Chuyển đổi dữ liệu favorite_genres từ object sang array cho biểu đồ
    const favoriteGenresData = userDetail?.favorite_genres
        ? Object.entries(userDetail.favorite_genres).map(([name, count]) => ({
            name,
            value: count
        }))
        : []

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-t-2 border-green-500 rounded-full"></div>
            </div>
        )
    }

    if (!userDetail || !userDetail.user_info) {
        return (
            <div className="space-y-6">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        className="mr-4"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5 mr-1" />
                        Quay lại
                    </Button>
                    <h1 className="text-3xl font-bold">Thông tin người dùng không tồn tại</h1>
                </div>
            </div>
        )
    }

    const { user_info, play_history, favorite_genres, playlists, favorite_songs, daily_activity } = userDetail

    return (
        <div className="space-y-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    className="mr-4"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-5 w-5 mr-1" />
                    Quay lại
                </Button>
                <h1 className="text-3xl font-bold">Thông tin người dùng</h1>
            </div>

            {/* Thông tin cơ bản người dùng */}
            <Card className="bg-zinc-800 border-zinc-700 text-white">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center">
                            <User className="w-10 h-10 text-zinc-400" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold">{user_info.username}</h2>
                            <p className="text-zinc-400">{user_info.email}</p>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4 text-zinc-500" />
                                    <span>Ngày tham gia: {new Date(user_info.date_joined).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm">
                                    <Clock className="w-4 h-4 text-zinc-500" />
                                    <span>Lần cuối đăng nhập: {new Date(user_info.last_login).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs thông tin chi tiết */}
            <Tabs defaultValue="activity" className="space-y-6">
                <TabsList className="bg-zinc-800">
                    <TabsTrigger value="activity" className="data-[state=active]:bg-zinc-700">
                        Hoạt động
                    </TabsTrigger>
                    <TabsTrigger value="playlists" className="data-[state=active]:bg-zinc-700">
                        Playlist
                    </TabsTrigger>
                    <TabsTrigger value="favorites" className="data-[state=active]:bg-zinc-700">
                        Yêu thích
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-6">
                    {/* Biểu đồ hoạt động hàng ngày */}
                    <Card className="bg-zinc-800 border-zinc-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LineChart className="h-5 w-5" />
                                <span>Hoạt động theo ngày</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Số lượt nghe nhạc theo ngày
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            {dailyActivityData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={dailyActivityData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                        <XAxis dataKey="date" stroke="#888" />
                                        <YAxis stroke="#888" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#333', border: 'none' }}
                                            labelStyle={{ color: '#fff' }}
                                        />
                                        <Bar dataKey="plays" fill="#1DB954" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-zinc-500">
                                    Không có dữ liệu để hiển thị
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Thể loại yêu thích */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Music className="h-5 w-5" />
                                    <span>Thể loại yêu thích</span>
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Phân bố lượt nghe theo thể loại
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                {favoriteGenresData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={favoriteGenresData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="name"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {favoriteGenresData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#333', border: 'none' }}
                                                formatter={(value, name, props) => [`${value} lượt nghe`, props.payload.name]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-zinc-500">
                                        Không có dữ liệu để hiển thị
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Lịch sử nghe nhạc */}
                        <Card className="bg-zinc-800 border-zinc-700 text-white">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    <span>Lịch sử nghe nhạc gần đây</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {play_history && play_history.length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                        {play_history.map((item: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-zinc-700 rounded flex items-center justify-center">
                                                        <Music className="w-4 h-4 text-zinc-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.song_title}</p>
                                                        <p className="text-xs text-zinc-400">{item.song_artist}</p>
                                                    </div>
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {new Date(item.played_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">
                                        Không có lịch sử nghe nhạc
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="playlists" className="space-y-6">
                    <Card className="bg-zinc-800 border-zinc-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListMusic className="h-5 w-5" />
                                <span>Danh sách playlist</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Các playlist do người dùng tạo
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {playlists && playlists.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {playlists.map((playlist: any, i: number) => (
                                        <div key={i} className="p-4 bg-zinc-900 rounded-md">
                                            <div className="w-full aspect-square bg-zinc-800 rounded-md mb-3 flex items-center justify-center">
                                                <ListMusic className="w-12 h-12 text-zinc-600" />
                                            </div>
                                            <h3 className="font-medium truncate">{playlist.name}</h3>
                                            <p className="text-xs text-zinc-400 mt-1">{playlist.song_count} bài hát</p>
                                            <p className="text-xs text-zinc-500 mt-1">
                                                Tạo: {new Date(playlist.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    Người dùng chưa tạo playlist nào
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-6">
                    <Card className="bg-zinc-800 border-zinc-700 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                <span>Bài hát yêu thích</span>
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Các bài hát được người dùng yêu thích
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {favorite_songs && favorite_songs.length > 0 ? (
                                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                    {favorite_songs.map((song: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <div className="text-zinc-400">{i + 1}</div>
                                                <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
                                                    <Music className="w-5 h-5 text-zinc-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{song.title}</p>
                                                    <p className="text-xs text-zinc-400">{song.artist}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-sm text-zinc-400">{song.album}</div>
                                                <div className="text-xs text-zinc-500">{song.play_count} lượt nghe</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    Người dùng chưa có bài hát yêu thích nào
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 