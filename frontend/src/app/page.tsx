import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <Link
      href="/parkList"
      className="flex flex-col items-center min-h-screen bg-white"
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
        <p className="text-5xl text-sky-400 font-bold">ParkNow</p>

        {/* タップ案内 */}
        <div className="flex flex-col items-center gap-2">
          <Image src="/touch.png" alt="touch" width={50} height={50} />
          <p className="text-sm text-gray-400">タップして始める</p>
        </div>
      </div>

      {/* 下部: 道路をイメージした赤いラインとイラスト */}
      <div className="w-full h-16 flex items-end justify-between px-4 border-b-7 border-red-500">
        <Image src="/track_header.png" alt="track_img" width={130} height={60} />
        <Image src="/car_header.png" alt="car_img" width={130} height={50} />
      </div>
    </Link>
  );
}
