"use client"
import { ChevronRight, Search, Edit, RefreshCw, Diamond, CreditCard, X, User, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-black/90">
        <div className="flex items-center gap-6">
          <Link href="/">
            <svg viewBox="0 0 78 24" width="78" height="24" className="text-white">
              <path
                fill="currentColor"
                d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
              />
            </svg>
          </Link>
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
          <div className="flex items-center gap-2">
            <Image
              src="/placeholder.svg?height=32&width=32"
              width={32}
              height={32}
              alt="Profile"
              className="rounded-full"
            />
            <span className="text-sm font-medium">Hồ sơ</span>
            <ChevronDown className="h-4 w-4 text-white/70" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-8 px-4">
        {/* Search bar */}
        <div className="relative mb-8 max-w-3xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Tìm kiếm tài khoản hoặc bài viết trợ giúp"
            className="pl-10 bg-zinc-800 border-none h-12 text-white focus-visible:ring-0"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Premium section */}
          <div className="col-span-2 bg-zinc-900 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Premium Individual</h2>
                <p className="text-white/70">Hóa đơn tiếp theo của bạn có giá 59.000₫ vào 25/5/25.</p>
                <p className="text-white/70">Ví MoMo</p>
              </div>
              <div className="flex-shrink-0">
                <svg viewBox="0 0 78 24" width="24" height="24" className="text-white">
                  <path
                    fill="currentColor"
                    d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Profile edit section */}
          <div className="bg-zinc-900 rounded-lg p-6 flex flex-col items-center justify-center">
            <div className="mb-4">
              <Edit className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-medium mb-1">Chỉnh sửa hồ sơ</h3>
          </div>

          {/* Account section */}
          <div className="col-span-full bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Tài khoản</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <Edit className="h-5 w-5 mr-4 text-white/70" />
                  <span>Chỉnh sửa hồ sơ</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 mr-4 text-white/70" />
                  <span>Khôi phục danh sách phát</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>
            </div>
          </div>

          {/* Registration section */}
          <div className="col-span-full bg-zinc-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Đăng ký</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <Diamond className="h-5 w-5 mr-4 text-white/70" />
                  <span>Gói đăng ký có sẵn</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-4 text-white/70" />
                  <span>Quản lý gói đăng ký</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-4 text-white/70" />
                  <span>Cập nhật thẻ</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>

              <div className="flex items-center justify-between p-3 hover:bg-zinc-800 rounded-md cursor-pointer transition-colors">
                <div className="flex items-center">
                  <X className="h-5 w-5 mr-4 text-white/70" />
                  <span>Hủy gói đăng ký</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/70" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
