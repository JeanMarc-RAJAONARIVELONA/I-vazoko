import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';

const { width, height } = Dimensions.get('window');
const WELCOME_HEADER_KEY = '@welcome_header_dismissed';

const WelcomeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { isWelcomeShown, setWelcomeShown } = useUserStore();

  if (!isWelcomeShown) return null;

  const handleDismiss = () => {
    setWelcomeShown(false);
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.tint }, {paddingHorizontal: width * 0.04}]}>
      <TouchableOpacity 
        style={styles.dismissButton}
        onPress={handleDismiss}
      >
        <Ionicons name="close" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.welcomeContent}>
        <Text style={styles.welcomeTitle}>Bienvenue sur I-vazoko</Text>
        <Text style={styles.welcomeSubtitle}>
          Votre lecteur de musique préféré !
        </Text>
        <Text style={styles.welcomeDescription}>
          Découvrez un nouveau lecteur de musique.{'\n'}
          Écoutez vos favoris à tout moment.{'\n'}
        </Text>
      </View>
      <Image
        source={require('../assets/images/women-listen.png')}
        style={styles.welcomeImage}
        contentFit="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dismissButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 15,
  },
  header: {
    height: height * 0.22,
    width: width * 0.93,
    display: 'flex',
    flexDirection: 'row',
    top: 0,
    borderRadius: 20,
    paddingInline: width * 0.04,
    margin: 10,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeContent: {
    flex: 1,
    zIndex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: 'bold',
    color: '#fff',
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  welcomeDescription: {
    fontSize: 12,
    lineHeight: 16,
    maxWidth: width * 0.6,
    color: '#fff',
    textAlign: 'left',
    marginBottom: 15,
  },
  welcomeImage: {
    width: width * 0.7,
    height: height * 0.25,
    position: 'absolute',
    top: -height * 0.031,
    right: -width * 0.33,
  },
});

export default WelcomeHeader;
