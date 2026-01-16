
export enum PageSize {
  A4 = 'A4',
  LETTER = 'LETTER',
  CUSTOM = 'CUSTOM'
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE'
}

export enum LayoutType {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL'
}

export enum Language {
  ENGLISH = 'EN',
  GUJARATI = 'GU'
}

export interface ImageState {
  id: 'img1' | 'img2';
  src: string | null;
  rotation: number; // 0-360
  scale: number; // 0.1 - 5
  x: number; // Offset from layout center (%)
  y: number; // Offset from layout center (%)
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  originalWidth: number;
  originalHeight: number;
}

export interface GlobalSettings {
  pageSize: PageSize;
  orientation: Orientation;
  layout: LayoutType;
  margin: number;
  spacing: number;
  customWidth: number;
  customHeight: number;
  dpi: number;
  language: Language;
}
