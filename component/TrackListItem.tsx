import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Track } from '@/store/audioStore';

const formatDuration = (duration: number): string => {
  if (!duration) return '0:00';
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface TrackListItemProps {
  track: Track;
  isPlaying?: boolean;
  theme: any;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({ 
  track, 
  isPlaying,
  theme 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]}>
          {track.title}
        </Text>
        <Text style={[styles.artist, { color: theme.textDim }]}>
          {track.artist} • {formatDuration(track.duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  artist: {
    fontSize: 14,
    marginTop: 4,
  }
});

export default TrackListItem;