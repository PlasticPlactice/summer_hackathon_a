import Image from "next/image";
import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-white pt-16">
      <div className="flex flex-col items-center flex-1 justify-start gap-10">
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
        {/* エラーメッセージ */}
        <p className="text-xs text-red-500 hidden">パスワードもしくはユーザーネームが正しくありません </p>
        {/* ログインフォーム */}
        <div className="flex flex-col items-center gap-2 shadow-md p-3 w-80">
          {/* ユーザーネーム */}
          <input
            type="text"
            placeholder="ユーザーネーム"
            className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
          />
          {/* パスワード */}
          <input
            type="password"
            placeholder="パスワード"
            className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
          />
          <Link
            href="/admin/home"
            className="flex items-center justify-center mt-2 h-[35px] w-full cursor-pointer self-center rounded-[5px] border border-[#0095FF] bg-[#C3E6FF] text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ログイン
          </Link>
        </div>
        <div className="flex gap-4">
          <h3 className="text-xs font-bold">アカウントをお持ちでない場合</h3>
          <Link
            href="/admin/userRegister"
            className="text-xs font-bold text-[#0095FF] hover:underline"
          >
            登録はこちら
          </Link>
        </div>
      </div>
    </main>
  );
}
