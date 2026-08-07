import { launchImageLibrary, type Asset } from 'react-native-image-picker';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';

/**
 * 附件类型。对齐 Flutter 示例 example/lib/tools 的 AttachmentKind：
 * 只"选择已有文件"，不做拍照/录音，从而完全规避相机/麦克风/相册权限
 * （两端都走系统选择器：image-picker 的相册选择器 + 系统文档选择器）。
 */
export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

export const ATTACHMENT_KINDS: readonly AttachmentKind[] = [
  'image',
  'video',
  'audio',
  'file',
];

export const ATTACHMENT_KIND_LABELS: Record<AttachmentKind, string> = {
  image: '图片',
  video: '视频',
  audio: '语音',
  file: '文件',
};

/**
 * 一次附件选择的记录。`path` 统一归一化为真实本地文件路径（无 file:// 前缀），
 * 可直接作为 SDK 消息接口（createImageMessage 等）的 filePath 参数。
 */
export interface AttachmentRecord {
  kind: AttachmentKind;
  name: string;
  path: string;
  size: number | null;
  mimeType: string | null;
  width?: number;
  height?: number;
  pickedAt: number;
}

export function recordToJson(record: AttachmentRecord): string {
  const { kind, name, path, size, mimeType, width, height, pickedAt } = record;
  const extension = name.includes('.') ? (name.split('.').pop() ?? '') : '';
  return JSON.stringify(
    {
      type: kind,
      name,
      path,
      size,
      ...(extension ? { extension } : {}),
      ...(mimeType ? { mimeType } : {}),
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
      pickedAt: new Date(pickedAt).toISOString(),
    },
    null,
    2
  );
}

/**
 * 把 picker 返回的 uri 归一化为真实本地文件路径：
 * - Android content://（PhotoPicker / SAF）拷贝到缓存目录（RNFS.copyFile 支持 content scheme）；
 * - file:// 去前缀（iOS 路径可能含百分号编码）。
 */
async function toLocalPath(uri: string, fileName: string): Promise<string> {
  if (uri.startsWith('content://')) {
    const dir = `${RNFS.CachesDirectoryPath}/attachments`;
    await RNFS.mkdir(dir);
    const dest = `${dir}/${Date.now()}_${fileName}`;
    await RNFS.copyFile(uri, dest);
    return dest;
  }
  return decodeURIComponent(uri.replace(/^file:\/\//, ''));
}

/** 图片/视频：react-native-image-picker（既定选型，iOS PHPicker / Android PhotoPicker 均免权限） */
async function pickMedia(
  kind: 'image' | 'video'
): Promise<AttachmentRecord | null> {
  const result = await launchImageLibrary({
    mediaType: kind === 'image' ? 'photo' : 'video',
    selectionLimit: 1,
  });
  if (result.didCancel) {
    return null;
  }
  if (result.errorCode) {
    throw new Error(result.errorMessage ?? result.errorCode);
  }
  const asset: Asset | undefined = result.assets?.[0];
  if (!asset?.uri) {
    throw new Error('选择器未返回文件');
  }
  const name = asset.fileName ?? `${kind}_${Date.now()}`;
  const record: AttachmentRecord = {
    kind,
    name,
    path: await toLocalPath(asset.uri, name),
    size: asset.fileSize ?? null,
    mimeType: asset.type ?? null,
    pickedAt: Date.now(),
  };
  if (kind === 'image') {
    record.width = asset.width;
    record.height = asset.height;
  }
  return record;
}

/** 语音/文件：@react-native-documents/picker（react-native-document-picker 的官方继任包） */
async function pickDocument(
  kind: 'audio' | 'file'
): Promise<AttachmentRecord | null> {
  const [doc] = await pick({
    type: [kind === 'audio' ? types.audio : types.allFiles],
  });
  // import 模式的拷贝位置可能被系统清理；keepLocalCopy 拷到缓存目录，拿到稳定本地路径
  const [copy] = await keepLocalCopy({
    files: [{ uri: doc.uri, fileName: doc.name ?? `${kind}_${Date.now()}` }],
    destination: 'cachesDirectory',
  });
  if (copy.status !== 'success') {
    throw new Error(copy.copyError);
  }
  const name = doc.name ?? copy.localUri.split('/').pop() ?? 'unknown';
  return {
    kind,
    name,
    path: decodeURIComponent(copy.localUri.replace(/^file:\/\//, '')),
    size: doc.size ?? null,
    mimeType: doc.type ?? null,
    pickedAt: Date.now(),
  };
}

/**
 * 选择一份附件：取消返回 null，成功返回 AttachmentRecord，失败抛错。
 * 无状态、不依赖任何页面，AI 脚本或任意测试场景也可直接调用。
 */
export async function pickAttachment(
  kind: AttachmentKind
): Promise<AttachmentRecord | null> {
  try {
    return kind === 'image' || kind === 'video'
      ? await pickMedia(kind)
      : await pickDocument(kind);
  } catch (e) {
    if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    throw e;
  }
}
