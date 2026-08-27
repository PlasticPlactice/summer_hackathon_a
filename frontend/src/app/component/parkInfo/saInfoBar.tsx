type SaInfoBarProps = {
  saName: string;
};

function SaInfoBar({ saName }: SaInfoBarProps) {
  // 現在時刻を「時:分」形式で取得(日本時間基準)
  const updatedAt = new Date().toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  });

  return (
    // SA名と最終更新時刻
    <div className="flex items-center justify-between">
      <h2 className="text-base font-bold">{saName}</h2>
      <span className="text-xs text-gray-500">最終更新 {updatedAt}</span>
    </div>
  );
}

export default SaInfoBar;
