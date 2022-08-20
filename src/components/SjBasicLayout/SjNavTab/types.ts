export interface TabInfo {
  key: string;
  fullPath: string;
  label: string;
  closable?: boolean;
  dragable?: boolean;
  swappable?: boolean;
  loading?: boolean;
  query?: any;
}
