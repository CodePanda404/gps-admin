export const baseUrlApi = (url: string) => {
  // 移除 url 开头的斜杠，避免双斜杠问题
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `/api/${cleanUrl}`;
};