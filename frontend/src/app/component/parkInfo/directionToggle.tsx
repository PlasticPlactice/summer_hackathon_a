function DirectionToggle() {
  return (
    // 上り/下り切替ボタン
    <div className="flex gap-2 my-1">
      <button className="rounded-full bg-[#0095ff] px-4 py-1.5 text-xs font-bold text-white">
        上り
      </button>
      <button className="rounded-full bg-[#ebedf0] px-4 py-1.5 text-xs text-[#595959]">
        下り
      </button>
    </div>
  );
}

export default DirectionToggle;
