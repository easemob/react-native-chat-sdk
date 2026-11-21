# Overview
C/C++ source code.  
The sources are a part of the project.  

# Usage
Run the `generate.sh` script before use.

# Directory Layout

## By platform
### android
    Android-specific C++ code. For example, log printing on Android cannot be done with standard C++.
### ios
    iOS-specific C++ code.
### win
    Windows-specific C++ code.
### mac
    macOS-specific C++ code.

## By language
### cpp
    The part that interfaces with standard C++ code.
### java
    The part that interfaces with JNI-related C++ code.
### objc
    The part that interfaces with Objective-C mixed C++ code.

## Common
### common
    Common code: object definitions, interface definitions, listener definitions, etc.
### core
    The main code of the extension SDK.
