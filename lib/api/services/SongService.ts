import { ApiRequest } from "../core/ApiRequest";
import { PaginatedResponse, SongData, ArtistData } from "../core/types";

/**
 * Service xử lý bài hát
 */
export class SongService extends ApiRequest {
  /**
   * Lấy danh sách bài hát
   * @param params Tham số phân trang và lọc
   * @returns Danh sách bài hát phân trang
   */
  async getSongs(params?: { page?: number; limit?: number; genre?: string }) {
    return this.get<PaginatedResponse<SongData>>(
      "/api/v1/music/songs/",
      params
    );
  }

  /**
   * Lấy chi tiết bài hát
   * @param id ID bài hát
   * @returns Thông tin chi tiết bài hát
   */
  async getSong(id: string) {
    return this.get<SongData>(`/api/v1/music/songs/${id}/`);
  }

  /**
   * Lấy bài hát trending
   * @returns Danh sách bài hát thịnh hành
   */
  async getTrendingSongs() {
    return this.get<{ trending_period_days: number; results: SongData[] }>(
      "/api/v1/music/songs/trending/"
    );
  }

  /**
   * Lấy bài hát đề xuất
   * @returns Danh sách bài hát đề xuất
   */
  async getRecommendedSongs() {
    return this.get<SongData[]>("/api/v1/music/songs/recommended/");
  }

  /**
   * Lấy xu hướng cá nhân
   * @returns Danh sách bài hát dựa trên lịch sử nghe
   */
  async getPersonalTrends() {
    return this.get<SongData[]>("/api/v1/music/songs/personal/");
  }

  /**
   * Tạo bài hát mới (upload)
   * @param songData Form data chứa thông tin bài hát
   * @returns Thông tin bài hát mới
   */
  async createSong(songData: FormData) {
    return this.post<SongData>("/api/v1/music/songs/", songData);
  }

  /**
   * Cập nhật bài hát
   * @param id ID bài hát
   * @param songData Thông tin bài hát cần cập nhật
   * @returns Thông tin bài hát sau khi cập nhật
   */
  async updateSong(id: string, songData: FormData | any) {
    return this.put<SongData>(`/api/v1/music/songs/${id}/`, songData);
  }

  /**
   * Xóa bài hát
   * @param id ID bài hát
   * @returns Kết quả xóa
   */
  async deleteSong(id: string) {
    return this.delete(`/api/v1/music/songs/${id}/`);
  }

  /**
   * Ghi nhận lượt phát
   * @param songId ID bài hát
   * @returns Kết quả ghi nhận
   */
  async playSong(songId: string) {
    return this.post(`/api/v1/music/songs/${songId}/play/`, {});
  }

  /**
   * Thích một bài hát
   * @param songId ID bài hát
   * @returns Kết quả thích
   */
  async likeSong(songId: string) {
    return this.post(`/api/v1/music/songs/${songId}/like/`, {});
  }

  /**
   * Bỏ thích một bài hát
   * @param songId ID bài hát
   * @returns Kết quả bỏ thích
   */
  async unlikeSong(songId: string) {
    return this.delete(`/api/v1/music/songs/${songId}/like/`);
  }

  /**
   * Lấy danh sách nghệ sĩ
   * @param params Tham số phân trang và lọc
   * @returns Danh sách nghệ sĩ phân trang
   */
  async getArtists(params?: { page?: number; limit?: number }) {
    return this.get<PaginatedResponse<ArtistData>>(
      "/api/v1/music/artists/",
      params
    );
  }

  /**
   * Tìm kiếm bài hát
   * @param query Từ khóa tìm kiếm
   * @returns Kết quả tìm kiếm
   */
  async searchSongs(query: string) {
    return this.get<SongData[]>("/api/v1/music/search/", {
      q: query,
      type: "song",
    });
  }
}
