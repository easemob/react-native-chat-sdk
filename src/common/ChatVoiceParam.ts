/**
 * 语音文件格式。
 */
export enum ChatVoiceFormat {
  /**
   * PCM 格式。
   */
  PCM = 'pcm',
  /**
   * AMR 格式。
   */
  AMR = 'amr',
  /**
   * MP3 格式。
   */
  MP3 = 'mp3',
}

/**
 * 语音参数类，描述语音文件的格式信息。
 *
 * 仅用作 {@link ChatManager.voiceFileToText} 的入参。
 */
export class ChatVoiceParam {
  /**
   * 语音文件的格式。详见 {@link ChatVoiceFormat}。
   */
  format: ChatVoiceFormat;
  /**
   * 语音文件的采样率，单位为 Hz。
   */
  sampleRate?: number;
  /**
   * 语音文件的采样位数。
   */
  bitsPerSample?: number;
  /**
   * 语音文件的声道数。
   */
  channels?: number;
  constructor(params: {
    format: ChatVoiceFormat;
    sampleRate?: number;
    bitsPerSample?: number;
    channels?: number;
  }) {
    this.format = params.format;
    this.sampleRate = params.sampleRate;
    this.bitsPerSample = params.bitsPerSample;
    this.channels = params.channels;
  }
}
