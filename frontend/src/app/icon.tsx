import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// ファビコンの画像メタデータ
export const size = {
  width: 64,
  height: 64,
};
export const contentType = "image/png";

// admin/page.tsxのアプリアイコン(car_header.png)をbase64で埋め込む
const carImage = await readFile(join(process.cwd(), "public/car_header.png"));
const carImageSrc = `data:image/png;base64,${carImage.toString("base64")}`;

// アイコン生成: admin/page.tsx 49〜55行目の「P Now」+車アイコンのデザインを
// ファビコンサイズ(64x64)に合わせて縮小したもの
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            color: "#38bdf8",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          <span style={{ fontSize: 26 }}>P</span>
          <span style={{ fontSize: 13, marginLeft: 2 }}>Now</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={carImageSrc}
          width={34}
          height={14}
          style={{ objectFit: "contain", marginTop: 2 }}
        />
      </div>
    ),
    {
      ...size,
    },
  );
}
