"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { AuthErrorAlert } from "@/components/ui/AuthErrorAlert"

// Define login schema validation with Zod
const loginSchema = z.object({
  email: z.string()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ"),
  password: z.string()
    .min(1, "Mật khẩu là bắt buộc"),
});

// Define type from schema
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, loginWithProvider, isLoading } = useAuth()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Initialize React Hook Form with Zod resolver
  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginForm) => {
    setError("")
    try {
      // Use login function directly, isLoading is handled in the login function of auth context
      await login(data.email, data.password)

      toast({
        title: "Đăng nhập thành công!",
        description: "Bạn sẽ được chuyển đến trang chủ.",
        variant: "default",
      })

      // Redirect to home page after 1 second
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (err: any) {
      console.error("Login error:", err)
      // Handle API errors
      if (err.response && err.response.status === 401) {
        setError("Email hoặc mật khẩu không đúng")
        toast({
          title: "Đăng nhập thất bại",
          description: "Email hoặc mật khẩu không đúng",
          variant: "destructive",
        })
      } else if (err.message && err.message.includes("No active account found with the given credentials")) {
        setError("Không tìm thấy tài khoản hoạt động với thông tin đăng nhập này")
        toast({
          title: "Đăng nhập thất bại",
          description: "Không tìm thấy tài khoản hoạt động với thông tin đăng nhập này",
          variant: "destructive",
        })
      } else if (err.message && err.message.includes("User not found")) {
        setError("Tài khoản không tồn tại")
        toast({
          title: "Đăng nhập thất bại",
          description: "Tài khoản không tồn tại",
          variant: "destructive",
        })
      } else if (err.message && err.message.includes("Invalid credentials")) {
        setError("Email hoặc mật khẩu không đúng")
        toast({
          title: "Đăng nhập thất bại",
          description: "Email hoặc mật khẩu không đúng",
          variant: "destructive",
        })
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại sau.")
        toast({
          title: "Đăng nhập thất bại",
          description: "Có lỗi xảy ra. Vui lòng thử lại sau.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      <Link href="/" className="absolute top-4 left-4 text-white flex items-center gap-1 hover:text-green-500 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Quay lại trang chủ
      </Link>

      <div className="w-full max-w-md bg-zinc-900 rounded-lg p-8">
        <div className="flex justify-center mb-8">
          <svg viewBox="0 0 78 24" width="78" height="24" className="text-white">
            <path
              fill="currentColor"
              d="M18.616 10.639c-3.77-2.297-9.99-2.509-13.59-1.388a1.077 1.077 0 0 1-1.164-.363 1.14 1.14 0 0 1-.119-1.237c.136-.262.37-.46.648-.548 4.132-1.287 11-1.038 15.342 1.605a1.138 1.138 0 0 1 .099 1.863 1.081 1.081 0 0 1-.813.213c-.142-.02-.28-.07-.403-.145Zm-.124 3.402a.915.915 0 0 1-.563.42.894.894 0 0 1-.69-.112c-3.144-1.983-7.937-2.557-11.657-1.398a.898.898 0 0 1-.971-.303.952.952 0 0 1-.098-1.03.929.929 0 0 1 .54-.458c4.248-1.323 9.53-.682 13.14 1.595a.95.95 0 0 1 .3 1.286Zm-1.43 3.267a.73.73 0 0 1-.45.338.712.712 0 0 1-.553-.089c-2.748-1.722-6.204-2.111-10.276-1.156a.718.718 0 0 1-.758-.298.745.745 0 0 1-.115-.265.757.757 0 0 1 .092-.563.737.737 0 0 1 .457-.333c4.455-1.045 8.277-.595 11.361 1.338a.762.762 0 0 1 .241 1.028ZM11.696 0C5.237 0 0 5.373 0 12c0 6.628 5.236 12 11.697 12 6.46 0 11.698-5.372 11.698-12 0-6.627-5.238-12-11.699-12h.001Z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">Đăng nhập vào Spotify</h1>

        <div className="space-y-4 mb-6">
          <Button
            onClick={() => loginWithProvider("Google")}
            className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Tiếp tục bằng Google
          </Button>

          <Button
            onClick={() => loginWithProvider("Facebook")}
            className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
            </svg>
            Tiếp tục bằng Facebook
          </Button>

          <Button
            onClick={() => loginWithProvider("Apple")}
            className="w-full bg-transparent border border-white/30 hover:border-white text-white flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
            </svg>
            Tiếp tục bằng Apple
          </Button>

          <Button
            className="w-full bg-transparent border border-white/30 hover:border-white text-white"
            disabled={isLoading}
          >
            Tiếp tục bằng số điện thoại
          </Button>
        </div>

        <div className="border-t border-white/10 pt-6 mb-6"></div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email hoặc tên người dùng
              </label>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Email hoặc tên người dùng"
                        {...field}
                        className="bg-zinc-800 border-zinc-700 text-white"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mật khẩu
              </label>
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mật khẩu"
                          {...field}
                          className="bg-zinc-800 border-zinc-700 text-white"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setShowPassword(!showPassword)
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/50"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && <AuthErrorAlert message={error} onClose={() => setError("")} />}

            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-black font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </Form>

        <div className="border-t border-white/10 pt-6 mt-6 text-center">
          <p className="text-white/70 mb-4">
            Bạn chưa có tài khoản?{" "}
            <Link href="/register" className="text-white hover:underline">
              Đăng ký Spotify
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
