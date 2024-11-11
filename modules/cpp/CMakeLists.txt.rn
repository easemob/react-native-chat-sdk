# warning: Android platform only.

cmake_minimum_required(VERSION 3.10.2)

project("ext_sdk")

set(EXTSDK_SOURCE_DIR ${CMAKE_CURRENT_SOURCE_DIR})

add_definitions(-DJAVA_LANGUAGE -DANDROID_PLATFORM -DREACT_NATIVE_ARCHITECTURE)

if(${CMAKE_BUILD_TYPE} STREQUAL Debug)
  add_definitions(-DDEBUG)
else()
  add_definitions(-DNDEBUG)
endif()

find_library(log-lib log)

aux_source_directory(${EXTSDK_SOURCE_DIR}/common EXTSDK_SOURCES_COMMON_FILES)
aux_source_directory(${EXTSDK_SOURCE_DIR}/java EXTSDK_SOURCES_JAVA_FILES)
aux_source_directory(${EXTSDK_SOURCE_DIR}/android EXTSDK_SOURCES_ANDROID_FILES)
aux_source_directory(${EXTSDK_SOURCE_DIR}/core EXTSDK_SOURCES_CORE_FILES)

add_library(
  ext_sdk SHARED
  ${EXTSDK_SOURCES_COMMON_FILES} ${EXTSDK_SOURCES_JAVA_FILES}
  ${EXTSDK_SOURCES_ANDROID_FILES} ${EXTSDK_SOURCES_CORE_FILES})

target_include_directories(
  ext_sdk
  PRIVATE ${EXTSDK_SOURCE_DIR}/common
  PRIVATE ${EXTSDK_SOURCE_DIR}/java
  PRIVATE ${EXTSDK_SOURCE_DIR}/android
  PRIVATE ${EXTSDK_SOURCE_DIR}/core)

target_link_libraries(ext_sdk ${log-lib})
