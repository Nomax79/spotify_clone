import { ApiRequest } from "../core/ApiRequest";
import { OfflineDownload } from "@/context/offline-context";

/**
 * Service quản lý tải nhạc nghe offline
 */
export class OfflineService extends ApiRequest {
  /**
   * Lấy danh sách các bài hát đã tải xuống
   * @returns Danh sách bài hát đã tải xuống
   */
  getDownloads() {
    return this.get<OfflineDownload[]>("/api/music/offline/downloads/");
  }

  /**
   * Yêu cầu tải xuống một bài hát
   * @param songId ID của bài hát cần tải xuống
   * @returns Thông tin về bài hát đang tải xuống
   */
  downloadSong(songId: number | string) {
    return this.post<{
      message: string;
      download: OfflineDownload;
    }>("/api/music/offline/download/", { song_id: songId });
  }

  /**
   * Kiểm tra trạng thái tải xuống của một bài hát
   * @param downloadId ID của lượt tải xuống
   * @returns Thông tin về trạng thái tải xuống
   */
  checkDownloadStatus(downloadId: number) {
    return this.get<OfflineDownload>(
      `/api/music/offline/downloads/${downloadId}/`
    );
  }

  /**
   * Xóa một bài hát đã tải xuống
   * @param downloadId ID của lượt tải xuống cần xóa
   * @returns Thông báo kết quả
   */
  deleteDownload(downloadId: number) {
    return this.delete<{ message: string }>(
      `/api/music/offline/downloads/${downloadId}/delete/`
    );
  }
}
