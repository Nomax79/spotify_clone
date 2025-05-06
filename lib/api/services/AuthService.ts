import { ApiRequest } from "../core/ApiRequest";
import { LoginResponse, RegisterUserData } from "../core/types";

/**
 * Service xử lý xác thực người dùng
 */
export class AuthService extends ApiRequest {
  /**
   * Đăng nhập người dùng
   * @param email Email người dùng
   * @param password Mật khẩu người dùng
   * @returns Thông tin đăng nhập và token
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const data = await this.post<LoginResponse>("/api/v1/auth/login/", {
      email,
      password,
    });

    // Lưu thông tin vào localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("spotify_token", data.access);
      localStorage.setItem("spotify_refresh_token", data.refresh);
      localStorage.setItem("spotify_user", JSON.stringify(data.user));
    }

    return data;
  }

  /**
   * Đăng ký người dùng mới
   * @param userData Thông tin người dùng
   * @returns Kết quả đăng ký
   */
  async register(userData: RegisterUserData) {
    return this.post("/api/v1/auth/register/", userData);
  }

  /**
   * Yêu cầu đặt lại mật khẩu
   * @param email Email người dùng
   * @returns Thông báo kết quả
   */
  async requestPasswordReset(email: string) {
    return this.post("/api/v1/auth/password-reset-request/", { email });
  }

  /**
   * Xác minh token và đặt lại mật khẩu
   * @param email Email người dùng
   * @param token Token xác minh
   * @param newPassword Mật khẩu mới
   * @returns Kết quả đặt lại mật khẩu
   */
  async verifyResetTokenAndSetPassword(
    email: string,
    token: string,
    newPassword: string
  ) {
    return this.post("/api/v1/auth/password-reset/verify/", {
      email,
      token,
      new_password: newPassword,
    });
  }

  /**
   * Đặt lại mật khẩu
   * @param token Token xác minh
   * @param password Mật khẩu mới
   * @returns Kết quả đặt lại mật khẩu
   */
  async resetPassword(token: string, password: string) {
    return this.post("/api/v1/auth/password-reset/confirm/", {
      token,
      password,
    });
  }

  /**
   * Đăng xuất
   * Xóa thông tin đăng nhập khỏi localStorage
   */
  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("spotify_token");
      localStorage.removeItem("spotify_refresh_token");
      localStorage.removeItem("spotify_user");
    }
  }
}
