const { withGradleProperties } = require("@expo/config-plugins");

/**
 * Config plugin to customize Gradle properties for the Android build.
 * This ensures memory settings persist even when android folder is regenerated.
 */
module.exports = function withGradlePropertiesModification(config) {
  return withGradleProperties(config, (config) => {
    const properties = config.modResults;

    // Function to set or update a property
    const setProperty = (key, value) => {
      const existingProperty = properties.find((p) => p.key === key);
      if (existingProperty) {
        existingProperty.value = value;
      } else {
        properties.push({ type: "property", key, value });
      }
    };

    // Set JVM arguments to increase memory allocation
    // This fixes OutOfMemoryError: Metaspace issues during builds
    setProperty(
      "org.gradle.jvmargs",
      "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError"
    );

    return config;
  });
};
