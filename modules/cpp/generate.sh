#!/bin/bash

# help: generate.sh --type <flutter|rn|unity>

# echo "type = $0, $1, $2"

if [ "$2" == "flutter" ]; then
    cp CMakeLists.txt.flutter CMakeLists.txt
    elif [ "$2" == "rn" ]; then
    cp CMakeLists.txt.rn CMakeLists.txt
else
    echo "help: generate.sh --type <flutter|rn|unity>"
fi