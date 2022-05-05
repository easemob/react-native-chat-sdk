export type ImageType = 'Image';
export type VideoType = 'Video';
export type VoiceType = 'Voice';
export type MediaType = ImageType | VideoType | VoiceType;

export type MediaType2 = {
  image: boolean;
  video: boolean;
  voice: boolean;
};
