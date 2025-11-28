import { LayoutAnimation, Platform } from 'react-native';

/**
 * Disables layout animations to prevent flickering during navigation
 * Call this before navigation actions that cause flickering
 */
export const disableLayoutAnimations = () => {
  if (Platform.OS === 'android') {
    LayoutAnimation.configureNext(LayoutAnimation.create(0, 'easeInEaseOut', 'opacity'));
  }
};

/**
 * Re-enables layout animations after navigation
 */
export const enableLayoutAnimations = () => {
  if (Platform.OS === 'android') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }
};

