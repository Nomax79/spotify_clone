/**
 * Postman-style API client
 * Tổ chức API calls theo cách tương tự như Postman collections và requests
 */

// Cấu hình API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://spotifybackend.shop",
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Interface cho response của thông tin người dùng
export interface UserResponse {
  is_admin: boolean;
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  following?: string[];
  created_at?: string;
}

// Interface cho response của API đăng nhập
export interface LoginResponse {
  access: string;
  refresh: string;
}

// Interface cho dữ liệu đăng ký người dùng
export interface RegisterUserData {
  email: string;
  username?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
}

// Lớp cơ sở cho tất cả các requests
class ApiRequest {
  protected async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    // Lấy token từ localStorage (nếu có)
    let token = null;
    if (typeof window !== "undefined") {
      token = localStorage.getItem("spotify_token");
    }

    // Chuẩn bị headers
    const headers: Record<string, string> = {
      ...API_CONFIG.defaultHeaders,
      ...customHeaders,
    };

    // Thêm token vào header nếu có
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Chuẩn bị options cho fetch
    const options: RequestInit = {
      method,
      headers,
    };

    // Thêm body cho các phương thức không phải GET
    if (method !== "GET" && data) {
      if (data instanceof FormData) {
        // Nếu là FormData, không set Content-Type để browser tự xử lý
        delete headers["Content-Type"];
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    // Xây dựng URL đầy đủ
    const url = new URL(endpoint, API_CONFIG.baseUrl);

    // Thêm query params cho phương thức GET
    if (method === "GET" && data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    try {
      // Thực hiện request
      const response = await fetch(url.toString(), options);

      // Xử lý refresh token nếu token hết hạn (401)
      if (response.status === 401 && token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Thử lại request với token mới
          return this.request<T>(method, endpoint, data, customHeaders);
        } else {
          // Nếu refresh token thất bại, chuyển hướng về trang đăng nhập
          if (typeof window !== "undefined") {
            localStorage.removeItem("spotify_token");
            localStorage.removeItem("spotify_refresh_token");
            localStorage.removeItem("spotify_user");
            window.location.href = "/login";
          }
          throw new Error("Authentication failed");
        }
      }

      // Kiểm tra response status
      if (!response.ok) {
        // Thêm response vào error để xử lý ở phía trên
        const error: any = new Error(
          `API error: ${response.status} ${response.statusText}`
        );
        error.response = response;
        error.status = response.status;

        // Cố gắng parse body nếu có
        try {
          const errorData = await response.json();
          error.data = errorData;
          if (errorData.detail) {
            error.message = errorData.detail;
          }
        } catch (e) {
          // Nếu không parse được JSON, giữ nguyên message lỗi
        }

        throw error;
      }

      // Parse JSON response
      const result = await response.json();
      return result as T;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Hàm refresh token (định nghĩa ở lớp cha để tránh lỗi TypeScript)
  protected async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const storedRefreshToken = localStorage.getItem("spotify_refresh_token");
    if (!storedRefreshToken) return false;

    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/token/refresh/`, {
        method: "POST",
        headers: API_CONFIG.defaultHeaders,
        body: JSON.stringify({ refresh: storedRefreshToken }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      localStorage.setItem("spotify_token", data.access);
      localStorage.setItem("spotify_refresh_token", data.refresh);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Các phương thức helper cho các loại request khác nhau
  protected get<T>(endpoint: string, params?: any): Promise<T> {
    return this.request<T>("GET", endpoint, params);
  }

  protected post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("POST", endpoint, data);
  }

  protected put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("PUT", endpoint, data);
  }

  protected patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>("PATCH", endpoint, data);
  }

  protected delete<T>(endpoint: string): Promise<T> {
    return this.request<T>("DELETE", endpoint);
  }
}

// Thêm hàm xử lý response có nội dung là media
const handleMediaResponse = async (response: Response) => {
  // Kiểm tra status code
  if (!response.ok) {
    if (response.status === 404) {
      console.error("Media not found:", response.url);
      throw new Error("Media not found");
    }
    const errorText = await response.text();
    console.error("Error fetching media:", errorText);
    throw new Error(
      `Error fetching media: ${response.status} ${response.statusText}`
    );
  }

  // Kiểm tra Content-Type
  const contentType = response.headers.get("Content-Type");
  if (contentType) {
    console.log("Media content type:", contentType);
  }

  return response;
};

// Thêm headers CORS và Accept cho media requests
const getMediaRequestHeaders = () => {
  return {
    Accept: "audio/*, video/*, image/*",
    "Access-Control-Allow-Origin": "*",
  };
};

// Collection cho Auth API
export class AuthCollection extends ApiRequest {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      return await this.post<LoginResponse>("/api/v1/auth/token/", {
        email,
        password,
      });
    } catch (error: any) {
      // Xử lý cụ thể lỗi đăng nhập
      if (error.status === 401) {
        const err = new Error(
          "No active account found with the given credentials"
        );
        err.name = "AuthenticationError";
        throw err;
      }
      throw error;
    }
  }

  // Ghi đè refreshToken (không bắt buộc vì đã có ở lớp cha, nhưng có thể để tùy chỉnh)
  override async refreshToken(): Promise<boolean> {
    return super.refreshToken(); // Gọi implementation ở lớp cha
  }

  register(userData: RegisterUserData) {
    return this.post("/api/v1/accounts/auth/register/", userData);
  }

  // Add password reset methods
  requestPasswordReset(email: string) {
    return this.post("/api/v1/accounts/auth/forgot-password/", { email });
  }

  verifyResetTokenAndSetPassword(
    email: string,
    token: string,
    newPassword: string
  ) {
    return this.post<any>("/api/v1/accounts/auth/verify-reset-token/", {
      email,
      token,
      new_password: newPassword,
    });
  }

  resetPassword(token: string, password: string) {
    return this.post("/api/v1/accounts/password-reset/confirm/", {
      token,
      password,
    });
  }
}

// Collection cho User API
export class AccountsCollection extends ApiRequest {
  getPublicUsers() {
    return this.get<any>("/api/v1/accounts/public/users/");
  }

  getUsers() {
    return this.get<any>("/api/v1/accounts/users/");
  }
  getUsers_ad() {
    return this.get<any>("/api/v1/accounts/admin/users/");
  }

  createUser(userData: any) {
    return this.post<any>("/api/v1/accounts/users/", userData);
  }

  getUser(id: string) {
    return this.get<any>(`/api/v1/accounts/users/${id}/`);
  }

  updateUser(id: string, userData: any) {
    return this.put<any>(`/api/v1/accounts/users/${id}/`, userData);
  }

  partialUpdateUser(id: string, userData: any) {
    return this.patch<any>(`/api/v1/accounts/users/${id}/`, userData);
  }

  deleteUser(id: string) {
    return this.delete<any>(`/api/v1/accounts/users/${id}/`);
  }

  followUser(id: string) {
    return this.post<any>(`/api/v1/accounts/users/${id}/follow/`);
  }

  unfollowUser(id: string) {
    return this.post<any>(`/api/v1/accounts/users/${id}/unfollow/`);
  }

  getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>("/api/v1/accounts/users/me/");
  }
}

// Collection cho Chat API
export class ChatCollection extends ApiRequest {
  getConversations() {
    return this.get("/api/v1/chat/conversations/");
  }

  getConversationWithUser(userId: string) {
    return this.get(`/api/v1/chat/conversations/${userId}/`);
  }

  getMessages() {
    return this.get("/api/v1/chat/messages/");
  }

  createMessage(messageData: any) {
    return this.post("/api/v1/chat/messages/", messageData);
  }

  getMessage(id: string) {
    return this.get(`/api/v1/chat/messages/${id}/`);
  }

  updateMessage(id: string, messageData: any) {
    return this.put(`/api/v1/chat/messages/${id}/`, messageData);
  }

  partialUpdateMessage(id: string, messageData: any) {
    return this.patch(`/api/v1/chat/messages/${id}/`, messageData);
  }

  deleteMessage(id: string) {
    return this.delete(`/api/v1/chat/messages/${id}/`);
  }
}

// Collection cho Music API
export class MusicCollection extends ApiRequest {
  // Playlist - theo tài liệu mới

  // Lấy danh sách playlist
  getPlaylists() {
    return this.get("/api/v1/music/playlists/");
  }

  // Lấy playlist theo ID
  getPlaylist(id: string) {
    return this.get(`/api/v1/music/playlists/${id}/`);
  }

  // Lấy playlist nổi bật
  getFeaturedPlaylists() {
    return this.get("/api/v1/music/playlists/featured/");
  }

  // Tạo playlist mới
  createPlaylist(playlistData: any) {
    return this.post("/api/v1/music/playlists/", playlistData);
  }

  // Cập nhật thông tin playlist
  updatePlaylist(id: string, playlistData: any) {
    return this.put(`/api/v1/music/playlists/${id}/`, playlistData);
  }

  // Xóa playlist
  deletePlaylist(id: string) {
    return this.delete(`/api/v1/music/playlists/${id}/`);
  }

  // Thêm bài hát vào playlist
  addPlaylistSong(playlistId: string, songId: string) {
    return this.post(`/api/v1/music/playlists/${playlistId}/add_song/`, {
      song_id: songId,
    });
  }

  // Xóa bài hát khỏi playlist
  removePlaylistSong(playlistId: string, songId: string) {
    return this.post(`/api/v1/music/playlists/${playlistId}/remove_song/`, {
      song_id: songId,
    });
  }

  // Cập nhật ảnh bìa playlist
  updatePlaylistCover(playlistId: string, formData: FormData) {
    return this.request<any>(
      "POST",
      `/api/v1/music/playlists/${playlistId}/update_cover_image/`,
      formData,
      {
        "Content-Type": "multipart/form-data",
      }
    );
  }

  // Cập nhật ảnh bìa playlist từ bài hát
  updatePlaylistCoverFromSong(playlistId: string, songId: string) {
    return this.post(
      `/api/v1/music/playlists/${playlistId}/update_cover_image/`,
      { song_id: songId }
    );
  }

  // Chuyển đổi chế độ công khai/riêng tư
  togglePlaylistPrivacy(id: string) {
    return this.post(`/api/v1/music/playlists/${id}/toggle_privacy/`);
  }

  // Theo dõi playlist
  followPlaylist(id: string) {
    return this.post(`/api/v1/music/playlists/${id}/follow/`);
  }

  // Bỏ theo dõi playlist
  unfollowPlaylist(id: string) {
    return this.post(`/api/v1/music/playlists/${id}/unfollow/`);
  }

  // Kiểm tra trạng thái theo dõi playlist
  checkFollowingPlaylist(id: string) {
    return this.get(`/api/v1/music/playlists/${id}/check_following/`);
  }

  // Lấy danh sách người theo dõi playlist
  getPlaylistFollowers(id: string) {
    return this.get(`/api/v1/music/playlists/${id}/followers/`);
  }

  // Chia sẻ playlist
  sharePlaylist(id: string, receiverId: string, content: string) {
    return this.post(`/api/v1/music/share/playlist/${id}/`, {
      receiver_id: receiverId,
      content,
    });
  }

  // Song - theo tài liệu mới
  uploadSong(formData: FormData) {
    return this.post("/api/v1/music/upload/", formData);
  }

  getSongs() {
    return this.get("/api/v1/music/songs/");
  }

  getSong(id: string) {
    return this.get(`/api/v1/music/songs/${id}/`);
  }

  updateSong(id: string, songData: any) {
    return this.put(`/api/v1/music/songs/${id}/`, songData);
  }

  deleteSong(id: string) {
    return this.delete(`/api/v1/music/songs/${id}/`);
  }

  playSong(id: string) {
    return this.post(`/api/v1/music/songs/${id}/play/`);
  }

  likeSong(id: string) {
    return this.post(`/api/v1/music/songs/${id}/like/`);
  }

  rateSong(id: string, rating: number) {
    return this.post(`/api/v1/music/songs/${id}/rate/`, { rating });
  }

  commentSong(id: string, comment: string) {
    return this.post(`/api/v1/music/songs/${id}/comment/`, { comment });
  }

  getSyncedLyrics(songId: string) {
    return this.get(`/api/v1/music/songs/${songId}/lyrics/synced/`);
  }

  addSyncedLyrics(
    songId: string,
    lyrics: Array<{ time: number; text: string }>
  ) {
    return this.post(`/api/v1/music/songs/${songId}/lyrics/synced/`, {
      synced_lyrics: lyrics,
    });
  }

  // Thư viện và Tìm kiếm - theo tài liệu mới
  getUserLibrary() {
    return this.get("/api/v1/music/library/");
  }

  search(query: string) {
    return this.get(`/api/v1/music/search/`, { q: query });
  }

  getSearchHistory() {
    return this.get("/api/v1/music/search-history/");
  }

  clearSearchHistory() {
    return this.delete("/api/v1/music/search-history/");
  }

  // Đề xuất và Xu hướng - theo tài liệu mới
  getSongRecommendations() {
    return this.get("/api/v1/music/recommendations/songs/");
  }

  getLikedBasedRecommendations() {
    return this.get("/api/v1/music/recommendations/liked/");
  }

  getYouMayLike() {
    return this.get("/api/v1/music/recommendations/may-like/");
  }
  getRecommended() {
    return this.get("/api/v1/music/recommendations/");
  }

  getRecommendedSongs() {
    return this.get("/api/v1/music/recommendations/songs/");
  }

  // Quản lý queue và player - theo tài liệu mới
  getQueue() {
    return this.get("/api/v1/music/queue/");
  }

  addToQueue(songId: string) {
    return this.post("/api/v1/music/queue/add/", { song_id: songId });
  }

  removeFromQueue(position: number) {
    return this.delete(`/api/v1/music/queue/remove/${position}/`);
  }

  clearQueue() {
    return this.delete("/api/v1/music/queue/clear/");
  }

  // Các phương thức tiện ích bổ sung
  getTrendingSongs() {
    return this.get("/api/v1/music/songs/trending/");
  }

  getPersonalTrends() {
    return this.get("/api/v1/music/trends/personal/");
  }

  getArtists(params?: { page?: number; limit?: number }) {
    return this.get("/api/v1/music/artists/", params);
  }

  getArtist(id: string) {
    return this.get(`/api/v1/music/artists/${id}/`);
  }

  getAlbums() {
    return this.get("/api/v1/music/albums/");
  }

  getAlbum(id: string) {
    return this.get(`/api/v1/music/albums/${id}/`);
  }

  getGenres() {
    return this.get("/api/v1/music/genres/");
  }
}

// Tạo các instance của các collection
export const postmanApi = {
  auth: new AuthCollection(),
  accounts: new AccountsCollection(),
  chat: new ChatCollection(),
  music: new MusicCollection(),
};

// Export default
export default postmanApi;
