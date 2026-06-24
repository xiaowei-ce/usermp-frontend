import { genderLabel, roleLabel } from './constants';

export { genderLabel, roleLabel };

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-';
  return dateStr.replace('T', ' ').substring(0, 19);
}
