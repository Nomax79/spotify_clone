import { BaseAdminService } from "./BaseAdminService";

/**
 * Interface thông tin bài hát cho admin
 */
export interface AdminSong {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  album?: {
    id: number;
    title: string;
    artist: string;
  };
  genre?: {
    id: number;
    name: string;
  };
  duration?: number;
  audio_file: string;
  cover_image?: string;
  lyrics?: string;
  release_date?: string;
  likes_count: number;
  play_count: number;
  comments_count: number;
  is_approved: boolean;
  uploaded_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  created_at: string;
  updated_at?: string;
  download_url?: string;
  stream_url?: string;
}

export interface AdminSongResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminSong[];
}

export interface AdminSongStats {
  total_songs: number;
  approved_songs: number;
  pending_songs: number;
  rejected_songs: number;
  total_play_count: number;
  total_likes_count: number;
  top_songs: Array<{
    id: number;
    title: string;
    artist: string;
    play_count: number;
    likes_count: number;
  }>;
  genres_distribution: Array<{
    genre: string;
    count: number;
    percentage: number;
  }>;
  monthly_uploads: Array<{
    month: string;
    count: number;
  }>;
}

/**
 * Service xử lý quản lý bài hát (Admin)
 */
export class AdminSongService extends BaseAdminService {
  private readonly BASE_URL = "/api/v1/music/admin/songs";

  /**
   * Lấy danh sách bài hát
   * @param params Tham số tìm kiếm, lọc và phân trang
   * @returns Danh sách bài hát phân trang
   */
  async getSongs(params?: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
    artist_id?: number;
    genre_id?: number;
    album_id?: number;
    is_approved?: boolean;
    uploaded_by?: number;
  }) {
    return this.getPaginatedData<AdminSongResponse>(
      this.BASE_URL + "/",
      params
    );
  }

  /**
   * Lấy chi tiết bài hát
   * @param id ID bài hát
   * @returns Thông tin chi tiết bài hát
   */
  async getSong(id: number) {
    return this.get<AdminSong>(`${this.BASE_URL}/${id}/`);
  }

  /**
   * Thêm bài hát mới
   * @param songData Form data chứa thông tin bài hát
   * @returns Thông tin bài hát mới
   */
  async createSong(songData: FormData) {
    return this.post<AdminSong>(this.BASE_URL + "/", songData);
  }

  /**
   * Cập nhật bài hát
   * @param id ID bài hát
   * @param songData Thông tin bài hát cần cập nhật
   * @returns Thông tin bài hát sau khi cập nhật
   */
  async updateSong(id: number, songData: FormData) {
    return this.put<AdminSong>(`${this.BASE_URL}/${id}/`, songData);
  }

  /**
   * Cập nhật một phần thông tin bài hát
   * @param id ID bài hát
   * @param songData Thông tin bài hát cần cập nhật
   * @returns Thông tin bài hát sau khi cập nhật
   */
  async partialUpdateSong(id: number, songData: Partial<AdminSong> | FormData) {
    return this.patch<AdminSong>(`${this.BASE_URL}/${id}/`, songData);
  }

  /**
   * Xóa bài hát
   * @param id ID bài hát
   * @returns Void
   */
  async deleteSong(id: number) {
    return this.delete(`${this.BASE_URL}/${id}/`);
  }

  /**
   * Phê duyệt bài hát
   * @param id ID bài hát
   * @returns Kết quả phê duyệt
   */
  async approveSong(id: number) {
    return this.post<{
      status: string;
      message: string;
      song: { id: number; title: string; is_approved: boolean };
    }>(`${this.BASE_URL}/${id}/approve/`, {});
  }

  /**
   * Từ chối bài hát
   * @param id ID bài hát
   * @param reason Lý do từ chối (tùy chọn)
   * @returns Kết quả từ chối
   */
  async rejectSong(id: number, reason?: string) {
    return this.post<{
      status: string;
      message: string;
      song: {
        id: number;
        title: string;
        is_approved: boolean;
        rejection_reason?: string;
      };
    }>(`${this.BASE_URL}/${id}/reject/`, reason ? { reason } : {});
  }

  /**
   * Upload file âm thanh
   * @param id ID bài hát
   * @param audioFile File âm thanh
   * @returns Kết quả upload
   */
  async uploadAudio(id: number, audioFile: File) {
    return this.uploadFile<{
      status: string;
      message: string;
      audio_file: string;
    }>(`${this.BASE_URL}/${id}/upload_audio/`, audioFile, "audio_file");
  }

  /**
   * Upload ảnh bìa
   * @param id ID bài hát
   * @param coverImage File ảnh bìa
   * @returns Kết quả upload
   */
  async uploadCover(id: number, coverImage: File) {
    return this.uploadFile<{
      status: string;
      message: string;
      cover_image: string;
    }>(`${this.BASE_URL}/${id}/upload_cover/`, coverImage, "cover_image");
  }

  /**
   * Lấy thống kê bài hát
   * @param params Tham số lọc thống kê
   * @returns Dữ liệu thống kê
   */
  async getStats(params?: {
    period?: "all" | "month" | "week" | "day";
    artist_id?: number;
    genre_id?: number;
  }) {
    return this.get<AdminSongStats>(`${this.BASE_URL}/stats/`, params);
  }
}
