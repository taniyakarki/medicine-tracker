import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";

// Type workaround for expo-file-system v19
// @ts-ignore - documentDirectory exists at runtime
const documentDirectory = FileSystem.documentDirectory as string;
import { Alert } from "react-native";

const PROFILE_PHOTOS_DIR = `${documentDirectory}profile_photos/`;

/**
 * Ensure the profile photos directory exists
 */
const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PROFILE_PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PROFILE_PHOTOS_DIR, {
      intermediates: true,
    });
  }
};

/**
 * Pick an image from the camera
 */
export const pickImageFromCamera = async (): Promise<string | null> => {
  try {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos."
      );
      return null;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile photos
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    // Process and save the image
    return await processAndSaveImage(result.assets[0].uri);
  } catch (error) {
    console.error("Error picking image from camera:", error);
    Alert.alert("Error", "Failed to take photo");
    return null;
  }
};

/**
 * Pick an image from the gallery
 */
export const pickImageFromGallery = async (): Promise<string | null> => {
  try {
    // Request media library permissions
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required to select photos."
      );
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile photos
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    // Process and save the image
    return await processAndSaveImage(result.assets[0].uri);
  } catch (error) {
    console.error("Error picking image from gallery:", error);
    Alert.alert("Error", "Failed to select photo");
    return null;
  }
};

/**
 * Process and save the image
 * - Resize to 400x400 for profile photos
 * - Compress to reduce file size
 * - Save to app's document directory
 */
const processAndSaveImage = async (uri: string): Promise<string> => {
  try {
    await ensureDirectoryExists();

    // Resize and compress the image
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 400, height: 400 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Generate unique filename
    const filename = `profile_${Date.now()}.jpg`;
    const newPath = `${PROFILE_PHOTOS_DIR}${filename}`;

    // Move the image to our directory
    await FileSystem.moveAsync({
      from: manipulatedImage.uri,
      to: newPath,
    });

    return newPath;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
};

/**
 * Delete a profile photo
 */
export const deleteProfilePhoto = async (uri: string): Promise<void> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri);
    }
  } catch (error) {
    console.error("Error deleting profile photo:", error);
    // Don't throw error, just log it
  }
};

/**
 * Show image picker options (Camera or Gallery)
 */
export const showImagePickerOptions = (): Promise<"camera" | "gallery" | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      "Change Profile Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: () => resolve("camera"),
        },
        {
          text: "Choose from Gallery",
          onPress: () => resolve("gallery"),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

