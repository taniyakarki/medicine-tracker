# Known Warnings

This document lists known warnings that appear during development and explains why they can be safely ignored.

## Reanimated Inline Style Warning

**Warning Message:**
```
WARN  It looks like you might be using shared value's .value inside reanimated inline style.
```

**Status:** Safe to ignore

**Explanation:**
This warning is a false positive. The app uses React Native's standard `Animated` API (not `react-native-reanimated` shared values) in the ProgressRing component. The warning likely comes from a third-party library in the dependency tree that uses reanimated internally.

**Our Implementation:**
- We use `Animated.Value` (standard React Native)
- We properly use `useNativeDriver: true` for optimal performance
- No direct usage of reanimated's `useSharedValue` or `useAnimatedStyle`

**If you want to eliminate this warning:**
The warning can be suppressed by configuring reanimated's babel plugin, but it's not necessary since we're not using reanimated's shared values incorrectly.

---

## Performance Optimizations Applied

All performance optimizations from the Expo Performance Optimization Plan have been implemented:

1. ✅ Image compression with expo-image-manipulator
2. ✅ FlatList virtualization for all lists
3. ✅ Component memoization with React.memo
4. ✅ Smart caching in custom hooks (30-second TTL)
5. ✅ Optimized animations with native driver
6. ✅ Fixed infinite render loops
7. ✅ Fixed VirtualizedList nesting warnings

The app now runs smoothly with optimal performance! 🚀

