import * as MusicLibrary from 'expo-music-library';
import { Track } from '@/store/audioStore';

/**
 * Request permission to access the device's music library
 * @returns A promise that resolves to a boolean indicating if permission was granted
 */
export const requestMusicLibraryPermission = async (): Promise<boolean> => {
  const { granted } = await MusicLibrary.requestPermissionsAsync();
  return granted;
};

/**
 * Fetch music assets from the device's music library
 * @param limit Maximum number of tracks to fetch
 * @returns A promise that resolves to an array of music library assets
 */
export const fetchMusicAssets = async (limit: number = 50): Promise<MusicLibrary.Asset[]> => {
  const { assets } = await MusicLibrary.getAssetsAsync({
    first: limit,
  });
  
  return assets || [];
};

/**
 * Convert music library assets to app Track format
 * @param assets Array of music library assets
 * @param defaultArtwork Default artwork to use if asset has none
 * @returns Array of Track objects
 */
export const convertAssetsToTracks = (
  assets: MusicLibrary.Asset[],
  defaultArtwork: any
): Track[] => {
  return assets.map(asset => ({
    id: asset.id,
    url: asset.uri,
    title: asset.filename ? asset.filename.replace(/\.[^/.]+$/, "") : "Unknown Title",
    artist: asset.artist || 'Unknown Artist',
    album: asset.albumId || 'Unknown Album',
    artwork: asset.artwork || defaultArtwork,
    duration: asset.duration || 0,
    creationTime: asset.creationTime,
  }));
};

/**
 * Filter out tracks that already exist in the library
 * @param newTracks Tracks to be added
 * @param existingTracks Existing tracks in the library
 * @returns Array of tracks that don't exist in the library
 */
export const filterDuplicateTracks = (
  newTracks: Track[],
  existingTracks: Track[]
): Track[] => {
  const existingIds = new Set(existingTracks.map(track => track.id));
  return newTracks.filter(track => !existingIds.has(track.id));
};
