
# For more information about using CMake with Android Studio, read the
# documentation: https://d.android.com/studio/projects/add-native-code.html

# Sets the minimum version of CMake required to build the native library.

cmake_minimum_required(VERSION 3.10.2)

project("ext_sdk")

add_subdirectory(${CMAKE_CURRENT_SOURCE_DIR}/../../../../native_src/cpp ${CMAKE_CURRENT_SOURCE_DIR}/../../../../native_src/output/cpp/build)
