import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white pt-16">
      <h2 className="text-base font-bold text-black">操作一覧</h2>
      <div className="mt-11 flex w-[246px] flex-col gap-11">
        <Link
          href="/admin/parkList"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] text-base text-black transition-opacity hover:opacity-90"
        >
          パーキング一覧
        </Link>
        <button className="h-[53px] cursor-pointer rounded-[5px] border border-[#cfbe00] bg-[#fbf7cd] text-base text-black transition-opacity hover:opacity-90">
          パーキングの登録
        </button>
        <Link
          href="/admin/imageRegister"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#e20000] bg-[#fbcdcd] text-base text-black transition-opacity hover:opacity-90"
        >
          画像の登録
        </Link>
        <Link
          href="/admin/sensors"
          className="flex h-[53px] cursor-pointer items-center justify-center rounded-[5px] border border-[#0095ff] bg-[#cde9fb] text-base text-black transition-opacity hover:opacity-90"
        >
          センサー管理
        </Link>
      </div>
    </main>
  );
}
