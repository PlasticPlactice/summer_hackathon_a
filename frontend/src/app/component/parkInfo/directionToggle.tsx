import Link from "next/link";

interface DirectionToggleProps {
  direction: "up" | "down";
}

function DirectionToggle({ direction }: DirectionToggleProps) {
  return (
    // 上り/下り切替リンク(?dir=up / ?dir=down でページ全体を再取得する)
    <div className="flex gap-2 my-1">
      <Link
        href="/parkInfo?dir=up"
        className={`rounded-full px-4 py-1.5 text-xs font-bold ${
          direction === "up" ? "bg-[#0095ff] text-white" : "bg-[#ebedf0] text-[#595959]"
        }`}
      >
        上り
      </Link>
      <Link
        href="/parkInfo?dir=down"
        className={`rounded-full px-4 py-1.5 text-xs font-bold ${
          direction === "down" ? "bg-[#0095ff] text-white" : "bg-[#ebedf0] text-[#595959]"
        }`}
      >
        下り
      </Link>
    </div>
  );
}

export default DirectionToggle;
