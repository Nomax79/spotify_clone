/**
 * Lớp cơ sở cho tất cả API requests
 * Cung cấp các phương thức chung và xử lý lỗi
 */

// Cấu hình API
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://spotifybackend.shop",
  defaultHeaders: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export class ApiRequest {
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

  // Hàm refresh token
  protected async refreshToken(): Promise<boolean> {
    if (typeof window === "undefined") return false;

    const storedRefreshToken = localStorage.getItem("spotify_refresh_token");
    if (!storedRefreshToken) return false;

    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/api/v1/auth/token/refresh/`,
        {
          method: "POST",
          headers: API_CONFIG.defaultHeaders,
          body: JSON.stringify({ refresh: storedRefreshToken }),
        }
      );

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

// Hàm tiện ích xử lý media responses
export const handleMediaResponse = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`Media request failed: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Hàm tiện ích lấy headers cho media requests
export const getMediaRequestHeaders = () => {
  const headers: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("spotify_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};
