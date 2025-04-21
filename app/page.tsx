"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Home, Search, Plus, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  // If user is logged in, redirect to the music app
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black">
        <div>
          <svg viewBox="0 0 78 24" width="78" height="24" className="text-white">
            <path
              fill="currentColor"
              d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
            />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-white hover:text-white hover:bg-transparent">
            Premium
          </Button>
          <Button variant="ghost" className="text-white hover:text-white hover:bg-transparent">
            Hỗ trợ
          </Button>
          <Button variant="ghost" className="text-white hover:text-white hover:bg-transparent">
            Tải xuống
          </Button>
          <div className="h-6 w-px bg-white/30 mx-2"></div>
          <Link href="/register">
            <Button variant="ghost" className="text-white hover:text-white hover:bg-transparent">
              Đăng ký
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8">Đăng nhập</Button>
          </Link>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-black p-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start text-white/70 hover:text-white">
                <Home className="mr-2 h-5 w-5" />
                Trang chủ
              </Button>
              <Button variant="ghost" className="justify-start text-white/70 hover:text-white">
                <Search className="mr-2 h-5 w-5" />
                Tìm kiếm
              </Button>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">Thư viện</h3>
                  <Plus className="h-5 w-5 text-white/70" />
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Tạo danh sách phát đầu tiên của bạn</h4>
                  <p className="text-sm text-white/70 mb-4">Rất dễ! Chúng tôi sẽ giúp bạn</p>
                  <Button className="bg-white text-black hover:bg-white/90 rounded-full text-sm">
                    Tạo danh sách phát
                  </Button>
                </div>
                <div className="bg-zinc-800 rounded-lg p-4">
                  <h4 className="font-bold mb-2">Hãy cùng tìm và theo dõi một số podcast</h4>
                  <p className="text-sm text-white/70 mb-4">Chúng tôi sẽ cập nhật cho bạn thông tin về các tập mới</p>
                  <Button className="bg-white text-black hover:bg-white/90 rounded-full text-sm">
                    Duyệt xem podcast
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 bg-gradient-to-b from-zinc-900 to-black p-6 overflow-auto">
          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Những bài hát thịnh hành
            <Button variant="link" className="text-white/70 hover:text-white text-sm">
              Hiển thị tất cả <ChevronRight className="h-4 w-4" />
            </Button>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { title: "vạn vật như muốn ta bên nhau", artist: "RIO" },
              { title: "ADAMN", artist: "Bình Gold" },
              { title: "Như Cách Anh Đã Từng Thôi", artist: "HURRYKNG" },
              { title: "Jumping Machine (跳跳机)", artist: "LBI利比" },
              { title: "Phép Màu - Đàn Cá Gỗ Original Soundtrack", artist: "MAYDAYs, Minh Tốc & Lâm" },
              { title: "Lệ Đường", artist: "Kai Đinh" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
              >
                <div className="relative mb-4">
                  <Image
                    src={`/placeholder.svg?height=160&width=160&text=${index + 1}`}
                    width={160}
                    height={160}
                    alt={item.title}
                    className="rounded w-full"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 ml-0.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </Button>
                </div>
                <div className="text-sm font-medium line-clamp-1">{item.title}</div>
                <div className="text-xs text-white/70 line-clamp-1 mt-1">{item.artist}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Nghệ sĩ phổ biến
            <Button variant="link" className="text-white/70 hover:text-white text-sm">
              Hiển thị tất cả <ChevronRight className="h-4 w-4" />
            </Button>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { name: "HIEUTHUHAI", type: "Nghệ sĩ" },
              { name: "Sơn Tùng M-TP", type: "Nghệ sĩ" },
              { name: "Dương Domic", type: "Nghệ sĩ" },
              { name: "SOOBIN", type: "Nghệ sĩ" },
              { name: 'ANH TRAI "SAY HI"', type: "Nghệ sĩ" },
              { name: "buitruonglinh", type: "Nghệ sĩ" },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
              >
                <div className="relative mb-4">
                  <Image
                    src={`/placeholder.svg?height=160&width=160&text=${item.name.charAt(0)}`}
                    width={160}
                    height={160}
                    alt={item.name}
                    className="rounded-full w-full"
                  />
                  <Link href="/messenger">
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 ml-0.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </Button></Link>
                </div>
                <div className="text-sm font-medium line-clamp-1">{item.name}</div>
                <div className="text-xs text-white/70 line-clamp-1 mt-1">{item.type}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4 flex justify-between items-center">
            Album và đĩa đơn nổi tiếng
            <Button variant="link" className="text-white/70 hover:text-white text-sm">
              Hiển thị tất cả <ChevronRight className="h-4 w-4" />
            </Button>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="bg-zinc-800/50 p-4 rounded-lg hover:bg-zinc-800/80 transition cursor-pointer group"
              >
                <div className="relative mb-4">
                  <Image
                    src={`/placeholder.svg?height=160&width=160&text=Album ${item}`}
                    width={160}
                    height={160}
                    alt={`Album ${item}`}
                    className="rounded w-full"
                  />
                  <Button
                    size="icon"
                    className="absolute bottom-2 right-2 rounded-full bg-green-500 text-black opacity-0 group-hover:opacity-100 transition shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 ml-0.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </Button>
                </div>
                <div className="text-sm font-medium line-clamp-1">Album Title {item}</div>
                <div className="text-xs text-white/70 line-clamp-1 mt-1">Various Artists</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-700 to-pink-500 p-3 flex justify-between items-center">
        <div>
          <h3 className="font-bold">Xem trước Spotify</h3>
          <p className="text-sm">
            Đăng ký để nghe không giới hạn các bài hát và podcast với quảng cáo không thường xuyên. Không cần thẻ tín
            dụng.
          </p>
        </div>
        <Link href="/register">
          <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8">Đăng ký miễn phí</Button>
        </Link>
      </div>
    </div>
  )
}
