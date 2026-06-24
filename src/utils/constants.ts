export const GENDER_MAP: Record<string, string> = {
  'true': '男',
  'false': '女',
  'null': '保密',
};

export function genderLabel(gender: boolean | null): string {
  return GENDER_MAP[String(gender)] ?? '保密';
}

export const ROLE_MAP: Record<number, string> = {
  0: '普通用户',
  1: '管理员',
};

export function roleLabel(role: number): string {
  return ROLE_MAP[role] ?? '未知';
}

export const DEFAULT_PAGE_SIZE = 10;
