import os
from ._ignore_files import ignore_files


def read_folder_files(
    folder_path: str, mapping: dict[str, str], sorted_keys: list[str]
):
    """_summary_
        Traverse all files in the folder and its subfolders
    Args:
        folder_path (str): target folder path
        mapping (dict[str, str]): key-value pairs for replacement
        sorted_keys (list[str]): sorted keys
    """
    # Traverse all files in the folder and its subfolders
    for root, dirs, files in os.walk(folder_path):
        # If it's a directory, continue traversing
        for dir in dirs:
            read_folder_files(os.path.join(root, dir), mapping, sorted_keys)

        # If it's a file, read its content
        for file in files:
            if file in ignore_files:
                continue
            # Concatenate file path
            file_path = os.path.join(root, file)
            # Read file content
            read_file_content(file_path, mapping, sorted_keys)


def read_file_content(file_path: str, mapping: dict[str, str], sorted_keys: list[str]):
    """_summary_
        Read file content
    Args:
        file_path (str): file path
        mapping (dict[str, str]): key-value pairs for replacement
        sorted_keys (list[str]): sorted keys
    """
    # Read file content
    with open(file_path, "r") as f:
        content = f.read()
        # Replace file content
        new_content = replace_content(content, mapping, sorted_keys)
        # Write the replaced content back to file
        write_file_content(file_path, new_content)


def replace_content(content: str, mapping: dict[str, str], sorted_keys: list[str]):
    """_summary_
        Replace file content with key-value pairs
    Args:
        content (str): original content
        mapping (dict[str, str]): key-value pairs for replacement
        sorted_keys (list[str]): sorted keys

    Returns:
        _type_: replaced content
    """
    # Replace file content
    new_content = content
    for key in sorted_keys:
        new_content = new_content.replace(key, mapping[key])
    return new_content


def write_file_content(file_path: str, content: str):
    """_summary_
        Write the replaced content back to file
    Args:
        file_path (str): file path
        content (str): replaced content
    """
    # Write the replaced content to file
    with open(file_path, "w") as f:
        f.write(content)
