"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const { register, loginWithProvider, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const { email, username, password, confirmPassword } = formData

    // Validate form
    if (!email) {
      setError("Vui lòng nhập địa chỉ email")
      return
    }

    if (!username) {
      setError("Vui lòng nhập tên người dùng")
      return
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu")
      return
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp")
      return
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Địa chỉ email không hợp lệ")
      return
    }

    try {
      await register({ email, username, password })
    } catch (err) {
      setError("Đăng ký thất bại. Vui lòng thử lại sau.")
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 78 24" width="78" height="24" className="text-white">
            <path
              fill="currentColor"
              d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-center mb-8">Đăng ký để bắt đầu nghe</h1>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Địa chỉ email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@domain.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Tên người dùng
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Tên người dùng"
              value={formData.username}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Mật khẩu
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mật khẩu"
              value={formData.password}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Xác nhận mật khẩu
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              disabled={isLoading}
            />
          </div>

          {error && <div className="text-red-500 text-sm mt-1">{error}</div>}

          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3"
            disabled={isLoading}
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký"}
          </Button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 absolute w-full"></div>
            <span className="bg-black px-4 relative text-white/70">hoặc</span>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => loginWithProvider("Google")}
              className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
              disabled={isLoading}
              type="button"
              title= "Đăng ký bằng Google"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              Đăng ký bằng Google
            </Button>

            <Button
              onClick={() => loginWithProvider("Facebook")}
              className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
              disabled={isLoading}
              type="button"
              title="Đăng ký bằng Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
              </svg>
              Đăng ký bằng Facebook
            </Button>

            <Button
              onClick={() => loginWithProvider("Apple")}
              className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
              disabled={isLoading}
              type="button"
              title="Đăng ký bằng Apple"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
              </svg>
              Đăng ký bằng Apple
            </Button>
          </div>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-white/70">
              Bạn đã có tài khoản?{" "}
              <Link href="/login" className="text-white hover:underline">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>

          <div className="text-xs text-white/50 text-center mt-8">
            <p>
              This site is protected by reCAPTCHA and the Google{" "}
              <Link href="#" className="underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="#" className="underline">
                Terms of Service
              </Link>{" "}
              apply.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
