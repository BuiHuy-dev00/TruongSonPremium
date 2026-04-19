import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("Không tải được ảnh (URL sai, chặn CORS, hoặc định dạng không hỗ trợ)."));
    img.src = src;
  });
}

/** Xuất JPEG mặc định — phù hợp ảnh sản phẩm, dung lượng nhỏ hơn PNG. */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  quality = 0.92
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Trình duyệt không hỗ trợ canvas.");

  const { width, height, x, y } = pixelCrop;
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  ctx.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không xuất được ảnh sau khi cắt."));
      },
      "image/jpeg",
      quality
    );
  });
}
