# Build Memory Configuration

## Problem
Android builds were failing with `OutOfMemoryError: Metaspace` during Gradle compilation, particularly during:
- Kotlin Symbol Processing (KSP)
- Lint analysis tasks
- Multiple expo module compilations

## Solution
Implemented a persistent configuration approach using Expo Config Plugins that survives native folder regeneration.

## Configuration Files

### 1. Config Plugin: `plugins/withGradleProperties.js`
Custom Expo config plugin that automatically configures Gradle memory settings when the Android folder is generated.

**Memory Settings Applied:**
- **Heap Size**: 4096MB (4GB)
- **Metaspace**: 1024MB (1GB)
- **HeapDump**: Enabled for debugging future OOM issues

### 2. App Configuration: `app.json`
Added the config plugin to the plugins array:
```json
"plugins": [
  "expo-router",
  "./plugins/withGradleProperties",
  // ... other plugins
]
```

### 3. EAS Build Configuration: `eas.json`
Added `resourceClass: "large"` for all build profiles to use more powerful EAS build machines:
- **development**: Uses large resource class
- **preview**: Uses large resource class
- **production**: Uses large resource class

## Benefits

✅ **Persistent Configuration**: Settings survive `android` folder deletion/regeneration
✅ **Version Controlled**: Configuration is tracked in git
✅ **Portable**: Works on any machine without manual setup
✅ **Cloud + Local**: Works for both EAS cloud builds and local builds
✅ **Maintainable**: Single source of truth for memory configuration

## Usage

### For Local Builds
The config plugin automatically applies settings when you run:
```bash
npx expo prebuild --platform android --clean
```

### For EAS Cloud Builds
The `resourceClass: "large"` setting ensures adequate resources:
```bash
eas build --platform android --profile production
```

### For Local EAS Builds
Both settings work together:
```bash
eas build --platform android --local
```

## Regenerating Native Folders

If you need to regenerate the `android` folder:

```bash
# Clean and regenerate
npx expo prebuild --platform android --clean

# Or just regenerate
npx expo prebuild --platform android
```

The Gradle memory settings will be automatically applied via the config plugin.

## Troubleshooting

If you still encounter memory issues:

1. **Check Gradle Daemon**: Kill and restart
   ```bash
   cd android
   ./gradlew --stop
   cd ..
   ```

2. **Verify Plugin Applied**: Check `android/gradle.properties` after prebuild
   ```bash
   cat android/gradle.properties | grep jvmargs
   ```
   Should show: `-Xmx4096m -XX:MaxMetaspaceSize=1024m`

3. **Increase Further**: Edit `plugins/withGradleProperties.js` and increase values

## Related Files
- `/plugins/withGradleProperties.js` - Config plugin
- `/app.json` - Plugin registration
- `/eas.json` - EAS build resource configuration
- `/android/gradle.properties` - Generated file (do not edit directly)

## Date Created
November 30, 2025

