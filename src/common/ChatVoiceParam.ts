/**
 * The voice file formats.
 */
export enum ChatVoiceFormat {
  /**
   * The PCM format.
   */
  PCM = 'pcm',
  /**
   * The AMR format.
   */
  AMR = 'amr',
  /**
   * The MP3 format.
   */
  MP3 = 'mp3',
}

/**
 * The voice parameter class, which describes the format information of a voice file.
 *
 * It is used only as the input parameter of {@link ChatManager.voiceFileToText}.
 */
export class ChatVoiceParam {
  /**
   * The format of the voice file. See {@link ChatVoiceFormat}.
   */
  format: ChatVoiceFormat;
  /**
   * The sample rate of the voice file, in Hz.
   */
  sampleRate?: number;
  /**
   * The number of bits per sample of the voice file.
   */
  bitsPerSample?: number;
  /**
   * The number of channels of the voice file.
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
