# 创建一个方法，读取文件夹以及子文件夹下的所有文件的内容
import os
from ._ignore_files import ignore_files


def read_folder_files(folder_path, mapping, sorted_keys):
    # 遍历文件夹以及子文件夹下的所有文件
    for root, dirs, files in os.walk(folder_path):
        # 如果是文件夹，继续遍历
        for dir in dirs:
            read_folder_files(os.path.join(root, dir), mapping, sorted_keys)

        # 如果是文件，读取文件内容
        for file in files:
            if file in ignore_files:
                continue
            # 拼接文件路径
            file_path = os.path.join(root, file)
            # 读取文件内容
            read_file_content(file_path, mapping, sorted_keys)


def read_file_content(file_path, mapping, sorted_keys):
    # 读取文件内容
    with open(file_path, "r") as f:
        content = f.read()
        # 替换文件内容
        new_content = replace_content(content, mapping, sorted_keys)
        # 将替换后的内容写入文件
        write_file_content(file_path, new_content)


def replace_content(content, mapping, sorted_keys):
    # 替换文件内容
    new_content = content
    for key in sorted_keys:
        new_content = new_content.replace(key, mapping[key])
    return new_content


def write_file_content(file_path, content):
    # 将替换后的内容写入文件
    with open(file_path, "w") as f:
        f.write(content)
