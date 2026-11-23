/**
 * 合并 class 名称的轻量工具。
 * 过滤假值（undefined/null/false），避免引入额外依赖。
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
