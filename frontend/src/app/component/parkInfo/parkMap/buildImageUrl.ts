// バックエンドのDBに保存されているimage_path(例: "./parking_images/3/parking_xxx.jpg")を
// ブラウザから直接読み込めるURLに変換する(backend/app/main.pyで/parking_imagesとして静的配信している)
export function buildImageUrl(imagePath: string | null): string | null {
  if (!imagePath) {
    return null;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedPath = imagePath.replace(/^\.?\/*/, "");
  return `${apiBaseUrl}/${normalizedPath}`;
}
