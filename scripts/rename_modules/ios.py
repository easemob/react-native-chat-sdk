#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# 这是一个模块代码重命名的脚本
# 使用名字映射列表，将模块代码中的关键字进行替换
# 参考文档: https://github.com/easemob/emclient-ios/blob/chatsdk/agorabuild/update_to_agora.py
# 使用示例: python rename_modules.py ios shengwang
# 使用示例: python rename_modules.py android shengwang


# 创建一个方法，读取文件夹以及子文件夹下的所有文件的内容
import os
from ._ios_data import mapping, sorted_keys
from ._replace import read_folder_files


if __name__ == "__main__":
    import sys

    # 获取参数个数
    args = sys.argv
    print(args)
    if len(args) < 2:
        print("must specify target_type")
        sys.exit(0)
    target_type = args[1]
    if target_type == "agora":
        sys.exit(0)
    if target_type == "shengwang":
        # 获取当前文件夹路径
        current_dir = os.path.dirname(os.path.abspath(__file__))
        # 指定文件夹路径
        folder_path = os.path.join(current_dir, "../../modules/objc")
        if (len(args) >= 3):
            folder_path = args[2]
        # 读取文件夹以及子文件夹下的所有文件
        read_folder_files(folder_path, mapping, sorted_keys)
