/**
 * Tag format validation utilities for iOS and Android Native SDK tags.
 *
 * iOS tag format: x.y.z (pure numeric semver, e.g. "4.17.0")
 * Android tag format: SDK_x.y.z[.w] (SDK_ prefix with optional 4th segment, e.g. "SDK_4.17.1")
 */

/** iOS tag regex: matches exactly x.y.z where x, y, z are digits */
export const IOS_TAG_REGEX = /^\d+\.\d+\.\d+$/;

/** Android tag regex: matches SDK_x.y.z with optional additional .w segments */
export const ANDROID_TAG_REGEX = /^SDK_\d+\.\d+\.\d+(\.\d+)*$/;

/**
 * Validates whether a string is a valid iOS SDK tag.
 * Valid format: x.y.z (e.g. "4.17.0")
 */
export function validateIosTag(tag: string): boolean {
  return IOS_TAG_REGEX.test(tag);
}

/**
 * Validates whether a string is a valid Android SDK tag.
 * Valid format: SDK_x.y.z or SDK_x.y.z.w (e.g. "SDK_4.17.0", "SDK_4.17.0.1")
 */
export function validateAndroidTag(tag: string): boolean {
  return ANDROID_TAG_REGEX.test(tag);
}
