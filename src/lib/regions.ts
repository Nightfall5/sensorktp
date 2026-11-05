export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RegionKind = 'nik' | 'alamat' | 'wajah' | 'manual';

export interface Region {
  id: string;
  kind: RegionKind;
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
}

export const REGION_LABELS: Record<RegionKind, string> = {
  nik: 'Nomor NIK',
  alamat: 'Alamat',
  wajah: 'Wajah',
  manual: 'Area manual',
};
