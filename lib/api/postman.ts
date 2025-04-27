/**
 * Postman-style API client
 * Tổ chức API calls theo cách tương tự như Postman collections và requests
 */

// Cấu hình API
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  defaultHeaders: {
    "Content-Type": "application/json",
  },
}

// Interface cho response của thông tin người dùng
export interface UserResponse {
  is_admin: boolean
  id: string
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_image?: string
  following?: string[]
  created_at?: string
}

// Interface cho response của API đăng nhập
export interface LoginResponse {
  access: string
  refresh: string
}

// Lớp cơ sở cho tất cả các requests
class ApiRequest {
  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>,
  ): Promise<T> {
    // Lấy token từ localStorage (nếu có)
    let token = null
    if (typeof window !== "undefined") {
      token = localStorage.getItem("spotify_token")
    }

    // Chuẩn bị headers
    const headers: Record<string, string> = {
      ...API_CONFIG.defaultHeaders,
      ...customHeaders,
    }

    // Thêm token vào header nếu có
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    // Chuẩn bị options cho fetch
    const options: RequestInit = {
      method,
      headers,
    }

    // Thêm body cho các phương thức không phải GET
    if (method !== "GET" && data) {
      if (data instanceof FormData) {
        // Nếu là FormData, không set Content-Type để browser tự xử lý
        delete headers["Content-Type"]
        options.body = data
      } else {
        options.body = JSON.stringify(data)
      }
    }

    // Xây dựng URL đầy đủ
    const url = new URL(endpoint, API_CONFIG.baseUrl)

    // Thêm query params cho phương thức GET
    if (method === "GET" && data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    try {
      // Thực hiện request
      const response = await fetch(url.toString(), options)

      // Xử lý refresh token nếu token hết hạn (401)
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken()
        if (refreshed) {
          // Thử lại request với token mới
          return this.request<T>(method, endpoint, data, customHeaders)
        } else {
          // Nếu refresh token thất bại, chuyển hướng về trang đăng nhập
          if (typeof window !== "undefined") {
            localStorage.removeItem("spotify_token")
            localStorage.removeItem("spotify_refresh_token")
            localStorage.removeItem("spotify_user")
            window.location.href = "/login"
          }
          throw new Error("Authentication failed")
        }
      }

      // Kiểm tra response status
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      // Parse JSON response
      const result = await response.json()
      return result as T
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Hàm refresh token (định nghĩa ở lớp cha để tránh lỗi TypeScript)
  protected async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false

    const storedRefreshToken = localStorage.getItem("spotify_refresh_token")
    if (!storedRefreshToken) return false

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/token/refresh/`, {
        method: "POST",
        headers: API_CONFIG.defaultHeaders,
        body: JSON.stringify({ refresh: storedRefreshToken }),
      })

      if (!response.ok) return false

      const data = await response.json()
      localStorage.setItem("spotify_token", data.access)
      localStorage.setItem("spotify_refresh_token", data.refresh)
      return true
    } catch (error) {
      console.error("Token refresh failed:", error)
      return false
    }
  }

  // Các phương thức helper cho các loại request khác nhau
  protected get<T>(endpoint: string, params?: any): Promise<T> {
    return this.request<T>("GET", endpoint, params)
  }

  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("POST", endpoint, data)
  }

  protected put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("PUT", endpoint, data)
  }

  protected patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("PATCH", endpoint, data)
  }

  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", endpoint)
  }
}

// Collection cho Auth API
export class AuthCollection extends ApiRequest {
  login(email: string, password: string): Promise<LoginResponse> {
    return this.post<LoginResponse>("/api/v1/auth/token/", { email, password })
  }

  // Ghi đè refreshToken (không bắt buộc vì đã có ở lớp cha, nhưng có thể để tùy chỉnh)
  override async refreshToken(): Promise<boolean> {
    return super.refreshToken() // Gọi implementation ở lớp cha
  }

  register(userData: any) {
    return this.post("/api/v1/accounts/auth/register/", userData)
  }

  // Add password reset methods
  requestPasswordReset(email: string) {
    return this.post("/api/v1/accounts/auth/forgot-password/", { email })
  }

  verifyResetTokenAndSetPassword(email: string, token: string, newPassword: string) {
    return this.post<any>("/api/v1/accounts/auth/verify-reset-token/", {
      email,
      token,
      new_password: newPassword,
    })
  }

  resetPassword(token: string, password: string) {
    return this.post("/api/v1/accounts/password-reset/confirm/", { token, password })
  }
}

// Collection cho User API
export class AccountsCollection extends ApiRequest {
  getPublicUsers() {
    return this.get<any>("/api/v1/accounts/public/users/")
  }

  getUsers() {
    return this.get<any>("/api/v1/accounts/users/")
  }
  getUsers_ad() {
    return this.get<any>("/api/v1/accounts/admin/users/")
  }

  createUser(userData: any) {
    return this.post<any>("/api/v1/accounts/users/", userData)
  }

  getUser(id: string) {
    return this.get<any>(`/api/v1/accounts/users/${id}/`)
  }

  updateUser(id: string, userData: any) {
    return this.put<any>(`/api/v1/accounts/users/${id}/`, userData)
  }

  partialUpdateUser(id: string, userData: any) {
    return this.patch<any>(`/api/v1/accounts/users/${id}/`, userData)
  }

  deleteUser(id: string) {
    return this.delete<any>(`/api/v1/accounts/users/${id}/`)
  }

  followUser(id: string) {
    return this.post<any>(`/api/v1/accounts/users/${id}/follow/`)
  }

  unfollowUser(id: string) {
    return this.post<any>(`/api/v1/accounts/users/${id}/unfollow/`)
  }

  getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>("/api/v1/accounts/users/me/")
  }
}

// Collection cho Chat API
export class ChatCollection extends ApiRequest {
  getConversations() {
    return this.get("/api/v1/chat/conversations/")
  }

  getConversationWithUser(userId: string) {
    return this.get(`/api/v1/chat/conversations/${userId}/`)
  }

  getMessages() {
    return this.get("/api/v1/chat/messages/")
  }

  createMessage(messageData: any) {
    return this.post("/api/v1/chat/messages/", messageData)
  }

  getMessage(id: string) {
    return this.get(`/api/v1/chat/messages/${id}/`)
  }

  updateMessage(id: string, messageData: any) {
    return this.put(`/api/v1/chat/messages/${id}/`, messageData)
  }

  partialUpdateMessage(id: string, messageData: any) {
    return this.patch(`/api/v1/chat/messages/${id}/`, messageData)
  }

  deleteMessage(id: string) {
    return this.delete(`/api/v1/chat/messages/${id}/`)
  }
}

// Collection cho Music API
export class MusicCollection extends ApiRequest {
  // Albums
  getAlbums() {
    return this.get("/api/v1/music/albums/")
  }

  createAlbum(albumData: any) {
    return this.post("/api/v1/music/albums/", albumData)
  }

  getAlbum(id: string) {
    return this.get(`/api/v1/music/albums/${id}/`)
  }

  updateAlbum(id: string, albumData: any) {
    return this.put(`/api/v1/music/albums/${id}/`, albumData)
  }

  partialUpdateAlbum(id: string, albumData: any) {
    return this.patch(`/api/v1/music/albums/${id}/`, albumData)
  }

  deleteAlbum(id: string) {
    return this.delete(`/api/v1/music/albums/${id}/`)
  }

  getAlbumSongs(id: string) {
    return this.get(`/api/v1/music/albums/${id}/songs/`)
  }

  // Comments
  getComments() {
    return this.get("/api/v1/music/comments/")
  }

  createComment(commentData: any) {
    return this.post("/api/v1/music/comments/", commentData)
  }

  getComment(id: string) {
    return this.get(`/api/v1/music/comments/${id}/`)
  }

  updateComment(id: string, commentData: any) {
    return this.put(`/api/v1/music/comments/${id}/`, commentData)
  }

  partialUpdateComment(id: string, commentData: any) {
    return this.patch(`/api/v1/music/comments/${id}/`, commentData)
  }

  deleteComment(id: string) {
    return this.delete(`/api/v1/music/comments/${id}/`)
  }

  // Features
  getBasicFeatures() {
    return this.get("/api/v1/music/features/basic/")
  }

  // Genres
  getGenres() {
    return this.get("/api/v1/music/genres/")
  }

  createGenre(genreData: any) {
    return this.post("/api/v1/music/genres/", genreData)
  }

  getGenre(id: string) {
    return this.get(`/api/v1/music/genres/${id}/`)
  }

  updateGenre(id: string, genreData: any) {
    return this.put(`/api/v1/music/genres/${id}/`, genreData)
  }

  partialUpdateGenre(id: string, genreData: any) {
    return this.patch(`/api/v1/music/genres/${id}/`, genreData)
  }

  deleteGenre(id: string) {
    return this.delete(`/api/v1/music/genres/${id}/`)
  }

  getGenreSongs(id: string) {
    return this.get(`/api/v1/music/genres/${id}/songs/`)
  }

  // Library
  getLibrary() {
    return this.get("/api/v1/music/library/")
  }

  // Playlists
  getPlaylists() {
    return this.get("/api/v1/music/playlists/")
  }

  createPlaylist(playlistData: any) {
    return this.post("/api/v1/music/playlists/", playlistData)
  }

  getPlaylist(id: string) {
    return this.get(`/api/v1/music/playlists/${id}/`)
  }

  updatePlaylist(id: string, playlistData: any) {
    return this.put(`/api/v1/music/playlists/${id}/`, playlistData)
  }

  partialUpdatePlaylist(id: string, playlistData: any) {
    return this.patch(`/api/v1/music/playlists/${id}/`, playlistData)
  }

  deletePlaylist(id: string) {
    return this.delete(`/api/v1/music/playlists/${id}/`)
  }

  addSongToPlaylist(id: string, songId: string) {
    return this.post(`/api/v1/music/playlists/${id}/add_song/`, { song_id: songId })
  }

  followPlaylist(id: string) {
    return this.post(`/api/v1/music/playlists/${id}/follow/`)
  }

  removeSongFromPlaylist(id: string, songId: string) {
    return this.post(`/api/v1/music/playlists/${id}/remove_song/`, { song_id: songId })
  }

  unfollowPlaylist(id: string) {
    return this.post(`/api/v1/music/playlists/${id}/unfollow/`)
  }

  // Public endpoints
  getPublicFeatures() {
    return this.get("/api/v1/music/public/features/")
  }

  getPublicPlaylists() {
    return this.get("/api/v1/music/public/playlists/")
  }

  publicSearch(query: string) {
    return this.get(`/api/v1/music/public/search/`, { q: query })
  }

  // Ratings
  getRatings() {
    return this.get("/api/v1/music/ratings/")
  }

  createRating(ratingData: any) {
    return this.post("/api/v1/music/ratings/", ratingData)
  }

  getRating(id: string) {
    return this.get(`/api/v1/music/ratings/${id}/`)
  }

  updateRating(id: string, ratingData: any) {
    return this.put(`/api/v1/music/ratings/${id}/`, ratingData)
  }

  partialUpdateRating(id: string, ratingData: any) {
    return this.patch(`/api/v1/music/ratings/${id}/`, ratingData)
  }

  deleteRating(id: string) {
    return this.delete(`/api/v1/music/ratings/${id}/`)
  }

  // Recommended
  getRecommended() {
    return this.get("/api/v1/music/recommended/")
  }

  // Search
  search(query: string) {
    return this.get(`/api/v1/music/search/`, { q: query })
  }

  // Songs
  getSongs() {
    return this.get("/api/v1/music/songs/")
  }

  createSong(songData: any) {
    return this.post("/api/v1/music/songs/", songData)
  }

  getSong(id: string) {
    return this.get(`/api/v1/music/songs/${id}/`)
  }

  updateSong(id: string, songData: any) {
    return this.put(`/api/v1/music/songs/${id}/`, songData)
  }

  partialUpdateSong(id: string, songData: any) {
    return this.patch(`/api/v1/music/songs/${id}/`, songData)
  }

  deleteSong(id: string) {
    return this.delete(`/api/v1/music/songs/${id}/`)
  }

  likeSong(id: string) {
    return this.post(`/api/v1/music/songs/${id}/like/`)
  }

  playSong(id: string) {
    return this.post(`/api/v1/music/songs/${id}/play/`)
  }

  getRecommendedSongs() {
    return this.get("/api/v1/music/songs/recommended/")
  }

  searchSongs(query: string) {
    return this.get(`/api/v1/music/songs/search/`, { q: query })
  }

  getTrendingSongs() {
    return this.get("/api/v1/music/songs/trending/")
  }

  // Trending
  getTrending() {
    return this.get("/api/v1/music/trending/")
  }

  // Upload
  uploadMusic(formData: FormData) {
    return this.request("POST", "/api/v1/music/", formData)
  }
}

// Tạo các instance của các collection
export const postmanApi = {
  auth: new AuthCollection(),
  accounts: new AccountsCollection(),
  chat: new ChatCollection(),
  music: new MusicCollection(),
}

// Export default
export default postmanApi
