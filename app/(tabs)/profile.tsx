import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Switch,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/context/ThemeContext";

export default function Profile() {
  const { name, profileImage, setName, setProfileImage } = useUserStore();
  const { theme, isDark, toggleTheme } = useTheme();
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(name);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
    }
    setEditName(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          title: "Profil",
          headerStyle: { backgroundColor: theme.cardBg },
          headerTintColor: theme.text,
        }}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Ionicons name="person" size={50} color={theme.textDim} />
              </View>
            )}
            <View style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color={theme.background} />
            </View>
          </TouchableOpacity>

          <View style={styles.nameSection}>
            {editName ? (
              <View style={styles.editNameContainer}>
                <TextInput
                  style={[
                    styles.nameInput,
                    { color: theme.text, borderColor: theme.border },
                  ]}
                  value={tempName}
                  onChangeText={setTempName}
                  autoFocus
                  onBlur={handleNameSave}
                  onSubmitEditing={handleNameSave}
                />
                <TouchableOpacity onPress={() => setEditName(false)}>
                  <Text style={{ color: theme.tint }}>Annuler</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nameDisplay}
                onPress={() => setEditName(true)}
              >
                <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
                <Ionicons name="pencil" size={20} color={theme.tint} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={[styles.settingsSection, { backgroundColor: theme.cardBg }]}
        >
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>
              Mode sombre
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.textDim, true: theme.tint }}
              thumbColor={theme.background}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    padding: 20,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    backgroundColor: "#E1E1E1",
    justifyContent: "center",
    alignItems: "center",
  },
  editImageButton: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  nameSection: {
    width: "100%",
    alignItems: "center",
  },
  nameDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
  },
  editNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  settingsSection: {
    marginTop: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
});
