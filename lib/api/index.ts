/**
 * API Client
 * Export các service để sử dụng trong ứng dụng
 */

import { AuthService } from "./services/AuthService";
import { SongService } from "./services/SongService";
import { PlaylistService } from "./services/PlaylistService";
import { GenresService } from "./services/GenresService";
import { AlbumService } from "./services/AlbumService";
import { ChatService } from "./services/ChatService";

// Tạo instance cho mỗi service
const authService = new AuthService();
const songService = new SongService();
const playlistService = new PlaylistService();
const genresService = new GenresService();
const albumService = new AlbumService();
const chatService = new ChatService();

// Export API client
export const api = {
  auth: authService,
  songs: songService,
  playlists: playlistService,
  genres: genresService,
  albums: albumService,
  chat: chatService,
};

// Export các type từ core
export * from "./core/types";
export * from "./services/GenresService";
export * from "./services/AlbumService";

// Export mặc định
export default api;
