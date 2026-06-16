/**
 * iOS and Android file path filtering utilities.
 *
 * Used by Skill 1 (Get Native Change Manifest) to filter
 * relevant public API files from git diff output.
 */

/**
 * List of Android internal implementation classes to exclude
 * from the public API change analysis.
 */
export const INTERNAL_CLASSES: readonly string[] = [
  "EMSmartHeartBeat.java",
  "EMHeartBeatReceiver.java",
  "EMMonitorReceiver.java",
  "EMJobService.java",
  "EMChatService.java",
  "EMEncryptProvider.java",
  "EMEncryptUtils.java",
  "EMCollector.java",
  "EMBase.java",
];

/**
 * Filters iOS file paths to include only public API header files.
 *
 * Rules:
 * - Must start with `newSDK/HyphenateSDK/`
 * - Must end with `.h`
 * - Must NOT end with `+Private.h`
 * - Must NOT end with `+Category.h`
 */
export function filterIosPath(path: string): boolean {
  return (
    path.startsWith("newSDK/HyphenateSDK/") &&
    path.endsWith(".h") &&
    !path.endsWith("+Private.h") &&
    !path.endsWith("+Category.h")
  );
}

/**
 * Extracts the basename (filename) from a file path.
 */
function basename(path: string): string {
  const lastSlash = path.lastIndexOf("/");
  return lastSlash === -1 ? path : path.slice(lastSlash + 1);
}

/**
 * Filters Android file paths to include only public API Java files.
 *
 * Rules:
 * - Must start with `hyphenatechatsdk/src/com/hyphenate/chat/`
 * - Filename must match `EM[^A]*.java` (EM*.java but not EMA*.java)
 * - Must NOT contain `/adapter/` subdirectory
 * - Must NOT contain `/core/` subdirectory
 * - Filename must NOT be in the INTERNAL_CLASSES exclusion list
 */
export function filterAndroidPath(path: string): boolean {
  if (!path.startsWith("hyphenatechatsdk/src/com/hyphenate/chat/")) {
    return false;
  }

  const filename = basename(path);

  // Must match EM[^A]*.java — starts with "EM", third char is NOT "A", ends with ".java"
  const emPattern = /^EM[^A].*\.java$/;
  if (!emPattern.test(filename)) {
    return false;
  }

  // Exclude /adapter/ and /core/ subdirectories
  if (path.includes("/adapter/") || path.includes("/core/")) {
    return false;
  }

  // Exclude internal classes
  if (INTERNAL_CLASSES.includes(filename)) {
    return false;
  }

  return true;
}
