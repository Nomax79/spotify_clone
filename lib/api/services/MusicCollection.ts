import { ApiRequest } from "../core/ApiRequest";
import {
  MusicCollection as IMusicCollection,
  PaginatedResponse,
  PlaylistData,
  SongData,
} from "../core/types";

export class MusicCollection extends ApiRequest implements IMusicCollection {
  // Các phương thức playlist
  getPlaylists(params?: { page?: number; limit?: number }) {
    return this.get<PaginatedResponse<PlaylistData>>(
      "/api/v1/music/playlists/",
      params
    );
  }

  getPlaylist(id: string) {
    return this.get<PlaylistData>(`/api/v1/music/playlists/${id}/`);
  }

  createPlaylist(data: FormData) {
    return this.request<PlaylistData>(
      "POST",
      "/api/v1/music/playlists/",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  updatePlaylist(playlistId: string | number, data: FormData) {
    return this.request<PlaylistData>(
      "PATCH",
      `/api/v1/music/playlists/${playlistId}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async deletePlaylist(id: string): Promise<void> {
    await this.delete(`/api/v1/music/playlists/${id}/`);
  }

  addSongToPlaylist(playlistId: string, songId: string) {
    return this.post<void>(`/api/v1/music/playlists/${playlistId}/add_song/`, {
      song_id: songId,
    });
  }

  removeSongFromPlaylist(playlistId: string, songId: string) {
    return this.post<void>(
      `/api/v1/music/playlists/${playlistId}/remove_song/`,
      {
        song_id: songId,
      }
    );
  }

  followPlaylist(playlistId: string) {
    return this.post<void>(`/api/v1/music/playlists/${playlistId}/follow/`, {});
  }

  unfollowPlaylist(playlistId: string) {
    return this.delete<void>(`/api/v1/music/playlists/${playlistId}/follow/`);
  }

  checkFollowingPlaylist(playlistId: string) {
    return this.get<{ following: boolean }>(
      `/api/v1/music/playlists/${playlistId}/following/`
    );
  }

  getPlaylistFollowers(playlistId: string) {
    return this.get<any>(`/api/v1/music/playlists/${playlistId}/followers/`);
  }

  togglePlaylistPrivacy(playlistId: string) {
    return this.post<PlaylistData>(
      `/api/v1/music/playlists/${playlistId}/toggle_privacy/`,
      {}
    );
  }

  sharePlaylist(playlistId: string, receiverId: string, content: string) {
    return this.post<void>(`/api/v1/music/share/playlist/${playlistId}/`, {
      receiver_id: receiverId,
      content,
    });
  }

  // Các phương thức khác của MusicCollection (nếu có)
}
