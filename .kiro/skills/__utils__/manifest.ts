/**
 * Change Manifest type definitions and validation utilities.
 *
 * The Change Manifest is the core data structure passed between Skills,
 * representing the structured set of Native SDK public API changes that
 * need to be synchronized to the React Native layer.
 */

// ─── Union Types ────────────────────────────────────────────────────────────────

export type ChangeType =
  | "new_api"
  | "deprecated_api"
  | "renamed_api"
  | "param_change"
  | "new_listener";

export type ManagerDomain =
  | "client"
  | "chat"
  | "group"
  | "contact"
  | "room"
  | "push"
  | "presence"
  | "thread"
  | "userinfo"
  | "conversation";

// ─── Interfaces ─────────────────────────────────────────────────────────────────

export interface ParamInfo {
  name: string;
  type: string;
  is_optional: boolean;
  default_value?: string;
}

export interface PlatformChange {
  file_path: string;
  method_signature: string;
  params: ParamInfo[];
  return_type: string;
  doc_comment: string;
}

export interface ChangeItem {
  id: string;
  type: ChangeType;
  domain: ManagerDomain;
  method_name: string;
  ios: PlatformChange | null;
  android: PlatformChange | null;
  description: string;
  is_listener: boolean;
}

export interface MisalignmentItem {
  description: string;
  ios_only: ChangeItem[];
  android_only: ChangeItem[];
  resolution?: "skip" | "include" | "defer";
}

export interface ChangeManifest {
  metadata: {
    generated_at: string;
    ios_old_tag: string;
    ios_new_tag: string;
    android_old_tag: string;
    android_new_tag: string;
  };
  changes: ChangeItem[];
  misalignments: MisalignmentItem[];
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const VALID_CHANGE_TYPES: readonly ChangeType[] = [
  "new_api",
  "deprecated_api",
  "renamed_api",
  "param_change",
  "new_listener",
];

const VALID_DOMAINS: readonly ManagerDomain[] = [
  "client",
  "chat",
  "group",
  "contact",
  "room",
  "push",
  "presence",
  "thread",
  "userinfo",
  "conversation",
];

// ─── Validation ─────────────────────────────────────────────────────────────────

/**
 * Validates that the given data conforms to the ChangeManifest structure.
 * Returns an object with `valid` (boolean) and `errors` (string array).
 */
export function validateManifest(data: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (data === null || data === undefined || typeof data !== "object") {
    errors.push("Manifest must be a non-null object");
    return { valid: false, errors };
  }

  const obj = data as Record<string, unknown>;

  // Validate metadata
  if (!obj.metadata || typeof obj.metadata !== "object") {
    errors.push("Missing or invalid 'metadata' field");
  } else {
    const metadata = obj.metadata as Record<string, unknown>;
    const requiredMetadataFields = [
      "generated_at",
      "ios_old_tag",
      "ios_new_tag",
      "android_old_tag",
      "android_new_tag",
    ];
    for (const field of requiredMetadataFields) {
      if (typeof metadata[field] !== "string") {
        errors.push(`metadata.${field} must be a string`);
      }
    }
  }

  // Validate changes array
  if (!Array.isArray(obj.changes)) {
    errors.push("'changes' must be an array");
  } else {
    for (let i = 0; i < obj.changes.length; i++) {
      const itemErrors = validateChangeItem(
        obj.changes[i] as unknown,
        `changes[${i}]`
      );
      errors.push(...itemErrors);
    }
  }

  // Validate misalignments array
  if (!Array.isArray(obj.misalignments)) {
    errors.push("'misalignments' must be an array");
  } else {
    for (let i = 0; i < obj.misalignments.length; i++) {
      const itemErrors = validateMisalignmentItem(
        obj.misalignments[i] as unknown,
        `misalignments[${i}]`
      );
      errors.push(...itemErrors);
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateChangeItem(item: unknown, path: string): string[] {
  const errors: string[] = [];

  if (item === null || item === undefined || typeof item !== "object") {
    errors.push(`${path} must be a non-null object`);
    return errors;
  }

  const obj = item as Record<string, unknown>;

  if (typeof obj.id !== "string" || obj.id.length === 0) {
    errors.push(`${path}.id must be a non-empty string`);
  }

  if (
    typeof obj.type !== "string" ||
    !VALID_CHANGE_TYPES.includes(obj.type as ChangeType)
  ) {
    errors.push(
      `${path}.type must be one of: ${VALID_CHANGE_TYPES.join(", ")}`
    );
  }

  if (
    typeof obj.domain !== "string" ||
    !VALID_DOMAINS.includes(obj.domain as ManagerDomain)
  ) {
    errors.push(`${path}.domain must be one of: ${VALID_DOMAINS.join(", ")}`);
  }

  if (typeof obj.method_name !== "string" || obj.method_name.length === 0) {
    errors.push(`${path}.method_name must be a non-empty string`);
  }

  if (obj.ios !== null) {
    const platformErrors = validatePlatformChange(obj.ios, `${path}.ios`);
    errors.push(...platformErrors);
  }

  if (obj.android !== null) {
    const platformErrors = validatePlatformChange(
      obj.android,
      `${path}.android`
    );
    errors.push(...platformErrors);
  }

  if (typeof obj.description !== "string") {
    errors.push(`${path}.description must be a string`);
  }

  if (typeof obj.is_listener !== "boolean") {
    errors.push(`${path}.is_listener must be a boolean`);
  }

  return errors;
}

function validatePlatformChange(item: unknown, path: string): string[] {
  const errors: string[] = [];

  if (item === null || item === undefined || typeof item !== "object") {
    errors.push(`${path} must be a non-null object or null`);
    return errors;
  }

  const obj = item as Record<string, unknown>;

  if (typeof obj.file_path !== "string") {
    errors.push(`${path}.file_path must be a string`);
  }

  if (typeof obj.method_signature !== "string") {
    errors.push(`${path}.method_signature must be a string`);
  }

  if (!Array.isArray(obj.params)) {
    errors.push(`${path}.params must be an array`);
  } else {
    for (let i = 0; i < obj.params.length; i++) {
      const paramErrors = validateParamInfo(
        obj.params[i] as unknown,
        `${path}.params[${i}]`
      );
      errors.push(...paramErrors);
    }
  }

  if (typeof obj.return_type !== "string") {
    errors.push(`${path}.return_type must be a string`);
  }

  if (typeof obj.doc_comment !== "string") {
    errors.push(`${path}.doc_comment must be a string`);
  }

  return errors;
}

function validateParamInfo(item: unknown, path: string): string[] {
  const errors: string[] = [];

  if (item === null || item === undefined || typeof item !== "object") {
    errors.push(`${path} must be a non-null object`);
    return errors;
  }

  const obj = item as Record<string, unknown>;

  if (typeof obj.name !== "string") {
    errors.push(`${path}.name must be a string`);
  }

  if (typeof obj.type !== "string") {
    errors.push(`${path}.type must be a string`);
  }

  if (typeof obj.is_optional !== "boolean") {
    errors.push(`${path}.is_optional must be a boolean`);
  }

  if (obj.default_value !== undefined && typeof obj.default_value !== "string") {
    errors.push(`${path}.default_value must be a string if provided`);
  }

  return errors;
}

function validateMisalignmentItem(item: unknown, path: string): string[] {
  const errors: string[] = [];

  if (item === null || item === undefined || typeof item !== "object") {
    errors.push(`${path} must be a non-null object`);
    return errors;
  }

  const obj = item as Record<string, unknown>;

  if (typeof obj.description !== "string") {
    errors.push(`${path}.description must be a string`);
  }

  if (!Array.isArray(obj.ios_only)) {
    errors.push(`${path}.ios_only must be an array`);
  } else {
    for (let i = 0; i < obj.ios_only.length; i++) {
      const itemErrors = validateChangeItem(
        obj.ios_only[i] as unknown,
        `${path}.ios_only[${i}]`
      );
      errors.push(...itemErrors);
    }
  }

  if (!Array.isArray(obj.android_only)) {
    errors.push(`${path}.android_only must be an array`);
  } else {
    for (let i = 0; i < obj.android_only.length; i++) {
      const itemErrors = validateChangeItem(
        obj.android_only[i] as unknown,
        `${path}.android_only[${i}]`
      );
      errors.push(...itemErrors);
    }
  }

  if (
    obj.resolution !== undefined &&
    obj.resolution !== "skip" &&
    obj.resolution !== "include" &&
    obj.resolution !== "defer"
  ) {
    errors.push(
      `${path}.resolution must be one of: skip, include, defer (or undefined)`
    );
  }

  return errors;
}

// ─── Misalignment Detection ─────────────────────────────────────────────────────

/**
 * Detects platform misalignments between iOS and Android change sets.
 *
 * Given two arrays of ChangeItems (one from iOS parsing, one from Android parsing),
 * finds items that exist in one platform but not the other by matching on the `id` field.
 *
 * Items present in `iosChanges` but with no matching `id` in `androidChanges` go into `ios_only`.
 * Items present in `androidChanges` but with no matching `id` in `iosChanges` go into `android_only`.
 */
export function detectMisalignments(
  iosChanges: ChangeItem[],
  androidChanges: ChangeItem[]
): MisalignmentItem[] {
  const iosIds = new Set(iosChanges.map((c) => c.id));
  const androidIds = new Set(androidChanges.map((c) => c.id));

  const iosOnly = iosChanges.filter((c) => !androidIds.has(c.id));
  const androidOnly = androidChanges.filter((c) => !iosIds.has(c.id));

  if (iosOnly.length === 0 && androidOnly.length === 0) {
    return [];
  }

  const misalignments: MisalignmentItem[] = [];

  if (iosOnly.length > 0 || androidOnly.length > 0) {
    misalignments.push({
      description: `Platform misalignment: ${iosOnly.length} iOS-only change(s), ${androidOnly.length} Android-only change(s)`,
      ios_only: iosOnly,
      android_only: androidOnly,
    });
  }

  return misalignments;
}
