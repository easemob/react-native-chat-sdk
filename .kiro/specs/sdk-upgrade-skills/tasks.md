# Implementation Plan: SDK Upgrade Skills

## Overview

Create 4 Kiro Skill files and their supporting utility functions for automating the HyphenateChat Native SDK upgrade process. Implementation starts with testable pure-logic utility functions, followed by property-based tests, then each Skill file in pipeline order.

## Tasks

- [x] 1. Create utility functions for testable pure logic
  - [x] 1.1 Create `.kiro/skills/__utils__/filter.ts` — iOS and Android file path filtering
    - Implement `filterIosPath(path: string): boolean` following the rules: starts with `newSDK/HyphenateSDK/`, ends with `.h`, excludes `+Private.h` and `+Category.h`
    - Implement `filterAndroidPath(path: string): boolean` following the rules: starts with `hyphenatechatsdk/src/com/hyphenate/chat/`, matches `EM[^A]*.java`, excludes `/adapter/` and `/core/` subdirectories, excludes internal classes list
    - Export the `INTERNAL_CLASSES` constant for the Android exclusion list
    - _Requirements: 1.3, 1.4, 1.7_

  - [x] 1.2 Create `.kiro/skills/__utils__/tag-validator.ts` — Tag format validation
    - Implement `validateIosTag(tag: string): boolean` matching pattern `^\d+\.\d+\.\d+$`
    - Implement `validateAndroidTag(tag: string): boolean` matching pattern `^SDK_\d+\.\d+\.\d+(\.\d+)*$`
    - Export the regex constants `IOS_TAG_REGEX` and `ANDROID_TAG_REGEX`
    - _Requirements: 6.5, 6.6_

  - [x] 1.3 Create `.kiro/skills/__utils__/version.ts` — Version number calculation
    - Define `SemVer` interface with `major`, `minor`, `patch`, and optional `prerelease` fields
    - Implement `parseSemVer(version: string): SemVer` to parse version strings including prerelease suffixes
    - Implement `bumpPatch(v: SemVer): SemVer` — increments patch, strips prerelease
    - Implement `bumpMinor(v: SemVer): SemVer` — increments minor, resets patch to 0, strips prerelease
    - Implement `formatSemVer(v: SemVer): string` to serialize back to string
    - _Requirements: 4.1, 4.2_

  - [x] 1.4 Create `.kiro/skills/__utils__/manifest.ts` — Change Manifest type definitions and validation
    - Define TypeScript interfaces: `ChangeManifest`, `ChangeItem`, `PlatformChange`, `ParamInfo`, `MisalignmentItem`
    - Define `ChangeType` and `ManagerDomain` union types
    - Implement `validateManifest(data: unknown): { valid: boolean; errors: string[] }` to validate manifest structure
    - Implement `detectMisalignments(iosChanges: ChangeItem[], androidChanges: ChangeItem[]): MisalignmentItem[]` to find platform-only changes
    - _Requirements: 1.5, 1.6_

- [x] 2. Write property-based tests for utility functions
  - [x] 2.1 Write property test for iOS file path filter
    - **Property 1: iOS File Path Filter Correctness**
    - **Validates: Requirements 1.3**
    - Use fast-check to generate random path strings covering: valid paths, paths missing prefix, paths with wrong extension, paths with `+Private.h`/`+Category.h` suffixes
    - Verify filter returns true iff all inclusion criteria met and no exclusion criteria triggered

  - [x] 2.2 Write property test for Android file path filter
    - **Property 2: Android File Path Filter Correctness**
    - **Validates: Requirements 1.4, 1.7**
    - Use fast-check to generate random path strings covering: valid `EM*.java` paths, `EMA*.java` adapter paths, internal class names, paths with `/adapter/` or `/core/` subdirectories
    - Verify filter returns true iff all inclusion criteria met and no exclusion criteria triggered

  - [x] 2.3 Write property test for tag format validation
    - **Property 7: Tag Format Validation**
    - **Validates: Requirements 6.5, 6.6**
    - Use fast-check to generate random strings and structured valid/invalid tags
    - Verify iOS validator accepts iff matches `^\d+\.\d+\.\d+$`
    - Verify Android validator accepts iff matches `^SDK_\d+\.\d+\.\d+(\.\d+)*$`

  - [x] 2.4 Write property test for version increment
    - **Property 6: Version Increment Correctness**
    - **Validates: Requirements 4.1, 4.2**
    - Use fast-check to generate random semver components (major, minor, patch, optional prerelease)
    - Verify `bumpPatch` increments only patch and strips prerelease
    - Verify `bumpMinor` increments minor, resets patch to 0, and strips prerelease

- [x] 3. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create Skill 1: Get Native Change Manifest
  - [x] 4.1 Create `.kiro/skills/01-get-native-change-manifest.md`
    - Write the Skill markdown document with sections: Trigger Conditions, Input Parameters, Execution Steps, Output, Human Intervention Points
    - Input parameters: `ios_old_tag`, `ios_new_tag`, `android_old_tag`, `android_new_tag`
    - Execution steps: validate tags → git diff iOS repo → filter iOS files → git diff Android repo → filter Android files → parse diffs → align changes → detect misalignments → generate Change Manifest JSON
    - Reference the utility functions from `__utils__/filter.ts` and `__utils__/tag-validator.ts` for filtering and validation logic
    - Include the iOS file filter rules (`newSDK/HyphenateSDK/**/*.h`, exclude `+Private.h`, `+Category.h`)
    - Include the Android file filter rules (`EM[^A]*.java`, exclude adapter/core/internal classes)
    - Include human intervention point for iOS/Android misalignment resolution
    - Include the Change Manifest JSON output schema
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 6.5, 6.6_

- [x] 5. Create Skill 2: Core Upgrade
  - [x] 5.1 Create `.kiro/skills/02-core-upgrade.md`
    - Write the Skill markdown document with sections: Trigger Conditions, Input Parameters, Execution Steps, Output, Human Intervention Points
    - Input parameters: Change Manifest JSON, `ios_sdk_version`, `android_sdk_version`
    - Execution steps: update podspec dependency → update build.gradle dependency → iterate Change Manifest → update Java wrappers → update ObjC wrappers → update TypeScript layer → run `yarn typecheck` → run `yarn lint:sdk`
    - Document the file modification mapping for each change type (`new_api`, `deprecated_api`, `renamed_api`, `param_change`, `new_listener`)
    - Include protected paths constraint: never modify `lib/`, `src/version.ts`, `modules/cpp/`, `modules/*/flutter/`
    - Include human intervention points: new wrapper file needed, complex type conversion, typecheck/lint failure
    - Include the method name constant sync rule (Consts.ts ↔ ExtSdkMethodType.java ↔ ExtSdkMethodTypeObjc.h)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 6.1, 6.2, 6.3, 6.4, 6.7, 6.8_

- [x] 6. Create Skill 3: Update Docs and Version
  - [x] 6.1 Create `.kiro/skills/03-update-docs-and-version.md`
    - Write the Skill markdown document with sections: Trigger Conditions, Input Parameters, Execution Steps, Output, Human Intervention Points
    - Input parameters: `upgrade_type` (bugfix | feature), `changelog_en`, `changelog_zh`, Change Manifest
    - Execution steps: calculate new version → update `package.json` version → update `doc:cn:update` script version → update `CHANGELOG.md` → update `CHANGELOG.zh.md` → update `docs/rn_api_overview.md`
    - Reference the utility functions from `__utils__/version.ts` for version calculation logic
    - Include version bump rules: bugfix → patch+1, feature → minor+1 with patch reset
    - Include CHANGELOG format template with Added/Deprecated/Changed sections
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 6.7_

- [x] 7. Create Skill 4: Generate Chinese API Docs
  - [x] 7.1 Create `.kiro/skills/04-generate-chinese-api-docs.md`
    - Write the Skill markdown document with sections: Trigger Conditions, Input Parameters, Execution Steps, Output, Human Intervention Points
    - Prerequisite: Skill 2 and Skill 3 completed
    - Execution steps: `bash restore.sh` → `python smart_merge_v5.py src` → supplement Chinese comments → `bash target.sh` → `yarn start` (api_docs_parser) → replace `rn_api_overview.zh.md` from line 14 → `yarn doc:cn`
    - Include strict execution order constraint (steps 1→2→3→4→5→6, no skipping)
    - Include human intervention point for new API Chinese comment supplementation
    - Include project paths for all involved repositories
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.7_

- [x] 8. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- The 4 Skill files are self-contained Markdown instruction documents that Kiro reads and follows
- Utility functions in `__utils__/` serve dual purpose: referenced by Skills for logic, and independently testable
- All utility code is TypeScript, matching the project's primary language

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.2", "2.3", "2.4"] },
    { "id": 2, "tasks": ["4.1", "6.1"] },
    { "id": 3, "tasks": ["5.1", "7.1"] }
  ]
}
```
