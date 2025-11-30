import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePickerLib from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import { Spacing, Typography } from '../../constants/design';
import { useTheme } from '../../lib/context/AppContext';
import { Card } from '../ui/Card';

interface ImagePickerProps {
  value?: string | null;
  onChange: (imageUri: string | null) => void;
  label?: string;
  error?: string;
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  value,
  onChange,
  label = 'Medicine Image',
  error,
}) => {
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePickerLib.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    
    return {
      camera: cameraStatus === 'granted',
      media: mediaStatus === 'granted',
    };
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Compress and resize image for optimal performance
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800, height: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const handleTakePhoto = async () => {
    const permissions = await requestPermissions();
    
    if (!permissions.camera) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in your device settings to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePickerLib.launchCameraAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        onChange(compressedUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error('Error taking photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFromGallery = async () => {
    const permissions = await requestPermissions();
    
    if (!permissions.media) {
      Alert.alert(
        'Media Library Permission Required',
        'Please enable media library access in your device settings to choose photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      const result = await ImagePickerLib.launchImageLibraryAsync({
        mediaTypes: ImagePickerLib.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        onChange(compressedUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to choose photo. Please try again.');
      console.error('Error choosing photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onChange(null),
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      'Choose Image',
      'Select an option to add a medicine image',
      [
        {
          text: 'Take Photo',
          onPress: handleTakePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: handleChooseFromGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      {value ? (
        <Card style={styles.imageCard}>
          <Image 
            source={{ uri: value }} 
            style={styles.image}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.imageOverlay}>
            <TouchableOpacity
              onPress={showImageOptions}
              style={[styles.overlayButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleRemoveImage}
              style={[styles.overlayButton, { backgroundColor: colors.error }]}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <TouchableOpacity
          onPress={showImageOptions}
          disabled={loading}
          style={[
            styles.uploadCard,
            { backgroundColor: colors.cardSecondary, borderColor: colors.border },
            error && { borderColor: colors.error },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <View
                style={[
                  styles.uploadIconContainer,
                  { backgroundColor: `${colors.primary}20` },
                ]}
              >
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.uploadText, { color: colors.text }]}>
                Add Medicine Image
              </Text>
              <Text style={[styles.uploadSubtext, { color: colors.textSecondary }]}>
                Take a photo or choose from gallery
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {error && (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      )}

      <Text style={[styles.helperText, { color: colors.textSecondary }]}>
        Optional: Add a photo to easily identify your medicine
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  uploadCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl * 2,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: Spacing.md,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  uploadSubtext: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
  },
  imageCard: {
    padding: 0,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  overlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    fontSize: Typography.fontSize.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
  },
});

