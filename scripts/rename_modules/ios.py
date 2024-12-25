#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# update time: 2024-12-25
# version: 1.0.0
# author: Asterisk Zuo
#
# This is a module code renaming script
# Using a name mapping list to replace keywords in module code
#
# Reference: https://github.com/easemob/emclient-ios/blob/chatsdk/agorabuild/update_to_agora.py
#
# usage: python -m rename_modules.ios [target_type] [folder_path]
#
# Example: python -m rename_modules.ios shengwang
# Example: python -m rename_modules.ios agora


# Create a method to read the contents of all files in a folder and its subfolders
import os
from ._ios_data import mapping, sorted_keys
from ._replace import read_folder_files


if __name__ == "__main__":
    import sys

    # Get number of arguments
    args = sys.argv
    print(args)
    if len(args) < 2:
        print("must specify target_type")
        sys.exit(0)
    target_type = args[1]
    if target_type == "agora":
        sys.exit(0)
    if target_type == "shengwang":
        # Get current directory path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # Specify folder path
        folder_path = os.path.join(current_dir, "../../modules/objc")
        if (len(args) >= 3):
            folder_path = args[2]
        # Read all files in folder and subfolders
        read_folder_files(folder_path, mapping, sorted_keys)
