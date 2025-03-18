import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

interface ImportMusicButtonProps {
  isLoading: boolean;
  onImport: () => Promise<void>;
  tracksCount: number;
  onClear: () => void;
}

const ImportMusicButton: React.FC<ImportMusicButtonProps> = ({
  isLoading,
  onImport,
  tracksCount,
  onClear,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.importContainer,
        { borderColor: theme.tint, backgroundColor: theme.buttonBg },
      ]}
      onPress={onImport}
      disabled={isLoading}
    >
      <Ionicons 
        name={isLoading ? "sync" : "musical-notes"} 
        size={30} 
        color={theme.text}
      />
      <Text style={[styles.importSubtitle, { color: theme.text }]}>
        {isLoading ? "Loading music files..." : "Import music from your device"}
      </Text>
      {tracksCount > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: theme.buttonBg }]}
          onPress={onClear}
        >
          <Text style={[styles.clearText, { color: theme.text }]}>
            Clear {tracksCount} tracks
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  importContainer: {
    width: width * 0.93,
    borderRadius: 10,
    padding: 10,
    margin: 10,
    alignItems: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
  },
  importSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  clearButton: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
  },
  clearText: {
    fontSize: 14,
  },
});

export default ImportMusicButton;
