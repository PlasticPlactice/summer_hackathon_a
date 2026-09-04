"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isDriving, setIsDriving] = useState(false);

  const handleTap = () => {
    if (isDriving) return; // 連打防止
    setIsDriving(true);

    // アニメーション時間と合わせて遷移
    setTimeout(() => {
      router.push("/parkList");
    }, 2000);
  };
  return (
    <div
      onClick={handleTap}
      className="animate-road flex flex-col items-center min-h-screen bg-white overflow-hidden"
      style={{
        backgroundImage: "url('/top_bg.png')",
        backgroundRepeat: "repeat-x",
        backgroundSize: "cover",
        animation: "road-scroll 30s linear infinite",
      }}
    >
      {/* 中央部分: アプリアイコン・アプリ名・タップ案内 */}
      <div className="flex flex-col items-center flex-1 justify-center gap-10">
        {/* アプリアイコン */}
        <div className="w-30 h-30 bg-white rounded-md shadow-md flex flex-col items-center justify-center gap-1">
          <p className="text-sky-400 font-bold leading-none">
            <span className="text-5xl">P</span>
            <span className="text-2xl"> Now</span>
          </p>
          <Image src="/car_header.png" alt="App Icon" className="w-full h-full object-contain p-1" width={70} height={28} />
        </div>

        {/* アプリ名 */}
        <p className="text-5xl text-white font-bold">ParkNow</p>

        {/* タップ案内 */}
        <div className="flex flex-col items-center gap-2">
          <Image src="/touch_white.png" alt="touch" width={50} height={50} />
          <p className="text-sm text-white">タップして始める</p>
        </div>
      </div>

      {/* 下部: 走っている風の道路アニメーション */}
      <div
        className="w-full h-16 flex items-end justify-around border-b-7 border-red-500"
      >
        {/* 車は画面中央あたりに固定して、上下に軽く揺らす */}
        <Image
          src="/track_header.png"
          alt="car_img"
          width={130}
          height={50}
          className={isDriving ? "animate-car-drive-off" : "animate-car-bounce"}
        />
        <Image
          src="/car_header.png"
          alt="car_img"
          width={130}
          height={50}
          className={isDriving ? "animate-car-drive-off" : "animate-car-bounce"}
        />
      </div>
    </div>
  );
}
