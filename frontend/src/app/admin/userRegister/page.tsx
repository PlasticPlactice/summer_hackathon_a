'use client';

import Link from "next/link";
import PassWordForm from "../../component/passWordForm";
import { useState } from 'react';

export default function AdminPage() {
  // ユーザーネームとパスワードの入力値を管理するstate
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // パスワードと確認用パスワードが一致しているかどうかを判定する
  const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  // ユーザーネームが入力されているかどうかを判定する
  const [username, setUsername] = useState('');
  const isUsernameEmpty = username.length === 0;
  //パスワード、確認用パスワードが入力されているかどうかを判定する
  const isPasswordEmpty = password.length === 0;
  const isConfirmPasswordEmpty = confirmPassword.length === 0;
  
  // 登録ボタンを活性化する条件(すべての必須項目が入力されているか)
  const canRegister = !isUsernameEmpty && !isPasswordEmpty && !isConfirmPasswordEmpty && !isMismatch;

  return (
    <main className="flex w-full flex-col items-center bg-white pb-10">
      <div className="flex w-full max-w-[390px] flex-col gap-5">
        {/* 戻るボタン */}
        <Link href="/admin/home" className="flex items-center gap-2 px-4 py-3 text-black">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs">戻る</span>
        </Link>
        {/* 登録するユーザーネーム */}
        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-base text-black">
            ユーザーネーム<span className="text-red-500">*</span>
          </h2>
          <input
            placeholder="ユーザーネーム"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
          />
          <p className="text-xs text-red-500 hidden">既にそのユーザーネームは使用されています</p>
        </section>
        {/* 登録するパスワード */}
        <section className="flex flex-col gap-3 px-4">
          <h2 className="text-base text-black">
            パスワード<span className="text-red-500">*</span>
          </h2>
          <label className="text-xs text-black font-bold">
            パスワードを入力してください
          </label>
            <PassWordForm
                id="password"
                value={password}
                onChange={setPassword}
                placeholder="パスワード"
            />
          {/* 登録するパスワードの確認 */}
          <label className="text-xs text-black font-bold">
            確認のため再度パスワードを入力してください
          </label>
          <PassWordForm
              id="confirmPassword"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="パスワード（確認用）"
              error={isMismatch ? 'パスワードが一致しません' : undefined}
          />
        </section>
        {/* 登録するボタン(色は/admin/page.tsxのパーキング一覧ボタンに合わせる) */}
        <button
          type="button"
          disabled={!canRegister}
          className="mt-2 h-[35px] w-[150px] cursor-pointer self-center rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          新規登録
        </button>
      </div>
    </main>
  );
}
