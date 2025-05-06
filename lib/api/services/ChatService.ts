import { BaseService } from "../core/BaseService";
import { Message, Song, Playlist } from "@/types";

export class ChatService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Lấy danh sách tin nhắn
   */
  async getMessages(): Promise<{ received: Message[]; sent: Message[] }> {
    const response = await this.get("/api/v1/music/messages/");
    return response;
  }

  /**
   * Gửi tin nhắn văn bản
   */
  async sendMessage(receiverId: string, content: string): Promise<Message> {
    const response = await this.post("/api/v1/music/messages/send/", {
      receiver_id: receiverId,
      content,
    });
    return response;
  }

  /**
   * Chia sẻ bài hát
   */
  async shareSong(
    songId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    const response = await this.post(`/api/v1/music/share/song/${songId}/`, {
      receiver_id: receiverId,
      content,
    });
    return response;
  }

  /**
   * Chia sẻ playlist
   */
  async sharePlaylist(
    playlistId: string,
    receiverId: string,
    content: string
  ): Promise<Message> {
    const response = await this.post(
      `/api/v1/music/share/playlist/${playlistId}/`,
      {
        receiver_id: receiverId,
        content,
      }
    );
    return response;
  }
}
