#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
中文 API 注释恢复脚本

本脚本通过 git diff 恢复上一中文版本的注释内容，是中文 TypeDoc 生成流程的一环。

使用前提（见 docs/superpowers/specs/2026-07-14-cn-typedoc-worktree-design.md）：
1. 当前目录是 cn worktree，HEAD 是上一版本中文注释状态
2. 工作区已被目标英文版本重置：git restore --source=<tag> --worktree -- .
3. 目标目录（默认 src/）中因此产生了可供分析的 diff

工作原理：
- 通过 git diff --no-prefix -U99999 获取完整的文件差异信息
- 跳过 diff 元信息（diff --git, index, ---, +++, @@ 等行）
- 对于 /** */ 注释块：
  * 如果注释块既有中文又有英文 → 移除英文部分，保留中文注释（计为"恢复"）
  * 如果注释块只有英文或只有中文 → 按正常 diff 规则处理（纯英文块计为"待翻译"）
- 对于非注释内容：
  * '-' 开头的行 → 删除（不包含在最终结果中）
  * '+' 开头的行 → 添加（包含在最终结果中）
  * ' ' 开头的行 → 保持不变（包含在最终结果中）

已知局限：
- 无中文的 @param 骨架行可能按 context 行保留，新版英文注释增删参数时，
  恢复出的中文注释参数列表可能过期且无告警。脚本运行后必须人工通读 git diff。
- git 可能把不同 API 的新旧注释错位对齐，导致代码被吞进注释或注释碎片
  残留为代码，且注释配对可能恰好配平。脚本在写入前校验"合并结果与目标
  版本的代码一致（忽略注释和空白）"，校验失败的文件保留英文版本并列入
  统计，需人工处理。

使用方法：
python3 scripts/docs/restore-cn-api-comments.py [源码目录，默认 src]

退出码：
0 成功（含校验失败回退的文件）；1 参数或环境错误；2 存在 diff 获取失败或文件读写失败
"""

import os
import re
import subprocess
import sys
from pathlib import Path
from typing import List, Tuple


class DiffBasedMerger:
    comment_start = "/**"
    comment_start2 = "/*"
    comment_end = "*/"

    def __init__(self, target_dir: str):
        self.target_dir = Path(target_dir)
        self.restored_block_count = 0
        self.english_block_count = 0
        self.invalid_files: List[str] = []
        self.failed = False

    def strip_comments(self, text: str) -> str:
        """移除块注释和行注释，返回剩余代码（去除全部空白后的）字符串。

        字符串字面量（单引号、双引号、模板字符串）内的注释标记会被跳过。
        模板字符串 ${} 内的注释标记不做处理，属于可接受的近似：
        合并结果与目标版本用同一函数处理，只要注释边界一致结果就是一致的，
        只有合并移动了注释边界才会产生差异——这正是要检测的情况。
        """
        result = []
        i, n = 0, len(text)
        state = None  # None | 'block' | 'line' | 'sq' | 'dq' | 'tpl'
        while i < n:
            c = text[i]
            nxt = text[i + 1] if i + 1 < n else ""
            if state is None:
                if c == "/" and nxt == "*":
                    state = "block"
                    i += 2
                    continue
                if c == "/" and nxt == "/":
                    state = "line"
                    i += 2
                    continue
                if c == "'":
                    state = "sq"
                elif c == '"':
                    state = "dq"
                elif c == "`":
                    state = "tpl"
                else:
                    if not c.isspace():
                        result.append(c)
                i += 1
            elif state == "block":
                if c == "*" and nxt == "/":
                    state = None
                    i += 2
                else:
                    i += 1
            elif state == "line":
                if c == "\n":
                    state = None
                i += 1
            else:  # 字符串状态
                if c == "\\":
                    i += 2
                    continue
                if state == "sq" and c == "'":
                    state = None
                elif state == "dq" and c == '"':
                    state = None
                elif state == "tpl" and c == "`":
                    state = None
                i += 1
        return "".join(result)

    def is_code_identical(self, original_text: str, merged_lines: List[str]) -> bool:
        """校验合并结果与目标版本的代码是否一致（忽略注释和空白）。

        恢复算法只应在注释块内做取舍，代码行按 diff 规则透传。但 git 可能把
        不同 API 的新旧注释错位对齐，导致代码被吞进注释、或注释碎片残留为代码。
        此类损坏不一定破坏注释配对（可能恰好配平），必须比较去注释后的代码。
        校验失败的文件保留目标英文版本，绝不允许写出损坏的文件。
        """
        merged_text = "\n".join(merged_lines) + "\n"
        return self.strip_comments(original_text) == self.strip_comments(merged_text)


    def get_full_diff(self, file_path: str) -> str:
        """获取完整的diff内容，失败时返回 None"""
        try:
            cmd = ["git", "diff", "--no-prefix", "-U99999", file_path]
            result = subprocess.run(
                cmd, capture_output=True, text=True, cwd=self.target_dir
            )
            if result.returncode != 0:
                print(f"获取diff失败 {file_path}: {result.stderr.strip()}")
                self.failed = True
                return None
            return result.stdout
        except Exception as e:
            print(f"获取diff失败 {file_path}: {e}")
            self.failed = True
            return None

    def skip_diff_header(self, diff_lines: List[str]) -> int:
        """跳过diff元信息，返回内容开始的行号"""
        for i, line in enumerate(diff_lines):
            if (
                line.startswith("diff --git")
                or line.startswith("index ")
                or line.startswith("--- ")
                or line.startswith("+++ ")
                or line.startswith("@@")
            ):
                continue
            else:
                return i
        return len(diff_lines)

    def has_chinese(self, text: str) -> bool:
        """检查是否包含中文"""
        return bool(re.search(r"[\u4e00-\u9fff]", text))

    def has_english(self, text: str) -> bool:
        """检查是否包含英文单词"""
        return bool(re.search(r"[a-zA-Z]{2,}", text))

    def remove_english_from_comment_block(self, comment_lines: List[str]) -> List[str]:
        """从注释块中移除英文，保留中文"""
        result = []

        for line in comment_lines:
            prefix = line[0] if line else " "
            content = line[1:] if len(line) > 1 else ""

            if prefix == "-":
                # 删除的行（原中文），保留
                result.append(content)
            elif prefix == "+":
                # 添加的行（新英文），需要删除
                continue
            elif prefix == " ":
                # 未修改的行，保留
                result.append(content)

        return result

    def extract_comment_block(
        self, content_lines: List[str], start_index: int
    ) -> Tuple[List[str], int]:
        """提取完整的注释块，返回(注释块行列表, 下一个处理的索引)"""
        comment_lines = []
        i = start_index

        while i < len(content_lines):
            line = content_lines[i]
            if not line:
                i += 1
                continue

            comment_lines.append(line)
            content = line[1:] if len(line) > 1 else ""

            # 如果遇到注释结束标记，结束提取
            if self.comment_end in content:
                i += 1
                break
            i += 1

        return comment_lines, i

    def process_comment_block(self, comment_lines: List[str]) -> List[str]:
        """处理注释块"""
        comment_content = ""
        for line in comment_lines:
            comment_content += line + "\n"

        # 检查注释块是否既有中文又有英文
        if self.has_chinese(comment_content) and self.has_english(comment_content):
            # 移除英文，保留中文
            self.restored_block_count += 1
            return self.remove_english_from_comment_block(comment_lines)
        else:
            # 按正常diff规则处理
            if not self.has_chinese(comment_content) and any(
                line.startswith("+") for line in comment_lines
            ):
                # 纯英文注释块且包含新增内容，属于待人工翻译项
                self.english_block_count += 1
            result = []
            for line in comment_lines:
                prefix = line[0] if line else " "
                content = line[1:] if len(line) > 1 else ""

                if prefix == "-":
                    # 删除的行，不包含在结果中
                    continue
                elif prefix == "+" or prefix == " ":
                    # 添加的行或未修改的行
                    result.append(content)
            return result

    def process_diff_content(self, diff_lines: List[str]) -> List[str]:
        """处理diff内容，生成最终文件"""
        start_index = self.skip_diff_header(diff_lines)
        content_lines = diff_lines[start_index:]

        result_lines = []
        i = 0

        while i < len(content_lines):
            line = content_lines[i]
            if not line:
                i += 1
                continue

            prefix = line[0] if line else " "
            content = line[1:] if len(line) > 1 else ""

            # 检查是否是注释块的开始
            if self.comment_start in content or self.comment_start2 in content:
                # 处理整个注释块
                comment_block, next_index = self.extract_comment_block(content_lines, i)

                # 需要判断下一行是否存在，如果存在判断是否开头是减号，如果是减号则注释快整体删除
                if next_index < len(content_lines):
                    next_line = content_lines[next_index]
                    if next_line.startswith("-"):
                        # 删除整个注释块
                        i = next_index
                        continue

                processed_block = self.process_comment_block(comment_block)
                result_lines.extend(processed_block)
                i = next_index
            else:
                # 非注释内容，按正常diff规则处理
                if prefix == "-":
                    # 删除的行，不包含在结果中
                    pass
                elif prefix == "+":
                    # 添加的行
                    result_lines.append(content)
                elif prefix == " ":
                    # 未修改的行
                    result_lines.append(content)
                i += 1

        return result_lines

    def process_file(self, file_path: str) -> bool:
        """处理单个文件，返回是否有 diff 被处理"""
        rel_path = os.path.relpath(file_path, self.target_dir)

        # 获取diff内容
        diff_content = self.get_full_diff(rel_path)
        if diff_content is None:
            return False
        if not diff_content:
            return False  # 没有diff

        # 处理diff
        diff_lines = diff_content.split("\n")
        result_lines = self.process_diff_content(diff_lines)

        # 写入前校验：合并结果与目标版本的代码必须一致（忽略注释和空白）。
        # 校验失败说明 git 把不同 API 的新旧注释错位对齐，合并破坏了代码结构。
        # 此时保留目标英文版本（工作区文件不被改写），该文件的注释恢复整体
        # 降级为待人工处理。
        full_path = self.target_dir / rel_path
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                original_text = f.read()
        except Exception as e:
            print(f"读取文件失败 {rel_path}: {e}")
            self.failed = True
            return False
        if not self.is_code_identical(original_text, result_lines):
            self.invalid_files.append(rel_path)
            print(f"警告: 代码一致性校验失败，已保留英文版本 ============ {rel_path}")
            return True

        # 写入文件
        try:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write("\n".join(result_lines) + "\n")
            return True
        except Exception as e:
            print(f"写入文件失败 {rel_path}: {e}")
            self.failed = True
            return False

    def get_typescript_files(self) -> List[str]:
        """递归获取所有TypeScript文件"""
        ts_files = []
        for root, dirs, files in os.walk(self.target_dir):
            for file in sorted(files):
                if file.endswith(".ts") or file.endswith(".tsx"):
                    ts_files.append(os.path.join(root, file))
        return ts_files

    def process_all_files(self):
        """处理所有TypeScript文件"""
        print("开始基于diff合并文件...")

        ts_files = self.get_typescript_files()
        total_count = len(ts_files)
        modified_count = 0

        for file_path in ts_files:
            rel_path = os.path.relpath(file_path, self.target_dir)

            if self.process_file(file_path):
                modified_count += 1
                print(f"处理文件: ✓ 已处理 ============ {rel_path}  ")
            else:
                print(f"处理文件: - 无变更 ============ {rel_path}  ")

        print(f"\n=== 处理完成 ===")
        print(f"总文件数: {total_count}")
        print(f"处理文件数: {modified_count}")
        print(f"无变更文件数: {total_count - modified_count}")
        print(f"恢复中文注释块数: {self.restored_block_count}")
        print(f"保留英文注释块数（待人工翻译）: {self.english_block_count}")
        if self.invalid_files:
            print(f"代码一致性校验失败文件数（已保留英文版本，需人工处理）: {len(self.invalid_files)}")
            for f in self.invalid_files:
                print(f"  - {f}")


def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "src"

    if not os.path.exists(target_dir):
        print(f"目录不存在: {target_dir}")
        sys.exit(1)

    merger = DiffBasedMerger(target_dir)
    merger.process_all_files()

    if merger.failed:
        print("\n存在 diff 获取失败或文件写入失败，请检查上方日志。")
        sys.exit(2)


if __name__ == "__main__":
    main()
