"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { musicApi } from "@/app/api/music"
import { AlbumCard, AlbumType } from "@/components/music/AlbumCard"
import { SongType } from "@/components/music/SongCard"
import { SongRow } from "@/components/music/SongRow"
import { SongListHeader } from "@/components/music/SongListHeader"
import { usePlayer } from "@/components/player/PlayerContext"
import { PlayButton } from "@/components/music/PlayButton"

interface ArtistType {
  id: number
  name: string
  image: string
  bio?: string
  monthly_listeners?: number
}

interface ArtistPageProps {
  params: {
    id: string
  }
}

export default function ArtistPage({ params }: ArtistPageProps) {
  const { id } = params
  const [artist, setArtist] = useState<ArtistType | null>(null)
  const [songs, setSongs] = useState<SongType[]>([])
  const [albums, setAlbums] = useState<AlbumType[]>([])
  const [loading, setLoading] = useState(true)
  const { play, currentSong } = usePlayer()

  useEffect(() => {
    async function fetchArtist() {
      try {
        setLoading(true)
        const response = await musicApi.getArtist(Number(id))
        setArtist(response.artist)
        setSongs(response.songs || [])
        setAlbums(response.albums || [])
      } catch (error) {
        console.error("Lỗi khi lấy thông tin nghệ sĩ:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchArtist()
    }
  }, [id])

  const handlePlayPopularSongs = () => {
    if (songs.length > 0) {
      play(songs[0], songs)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="flex flex-col items-center md:flex-row md:items-end gap-8 mb-8">
            <div className="w-48 h-48 rounded-full bg-zinc-800"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-zinc-800 rounded w-48"></div>
              <div className="h-4 bg-zinc-800 rounded w-32"></div>
            </div>
          </div>
          <div className="space-y-4 mt-12">
            <div className="h-8 bg-zinc-800 rounded w-40"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-800 rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!artist) {
    return <div className="container mx-auto p-8">Không tìm thấy nghệ sĩ</div>
  }

  return (
    <div>
      {/* Cover image and artist info */}
      <div
        className="relative w-full h-[40vh] bg-gradient-to-b from-blue-900/30 to-black flex items-end"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url(${artist.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top'
        }}
      >
        <div className="container mx-auto px-6 pb-12 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-48 h-48 rounded-full border-4 border-white/10 overflow-hidden shadow-xl">
            <Image
              src={artist.image || "/placeholder-artist.jpg"}
              alt={artist.name}
              width={192}
              height={192}
              className="object-cover"
            />
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-4xl font-bold mb-2">{artist.name}</h1>
            {artist.monthly_listeners && (
              <p className="text-zinc-400 text-sm mb-4">
                {new Intl.NumberFormat().format(artist.monthly_listeners)} người nghe hàng tháng
              </p>
            )}
            <PlayButton
              size="lg"
              onClick={handlePlayPopularSongs}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Popular songs */}
        {songs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Phổ biến</h2>
            <div className="rounded-lg overflow-hidden bg-zinc-900/30">
              <SongListHeader />
              <div className="space-y-1 py-2">
                {songs.slice(0, 5).map((song, index) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={index}
                    songs={songs}
                    isActive={currentSong?.id === song.id}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Albums */}
        {albums.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Album của {artist.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </div>
        )}

        {/* Artist Bio */}
        {artist.bio && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Giới thiệu</h2>
            <div className="text-zinc-300 max-w-3xl">
              <p>{artist.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
