// 施設アイコンの識別子
export type FacilityKey =
  | "parking"
  | "toilet"
  | "food"
  | "gasStation"
  | "info"
  | "bed";

// 施設アイコン一覧(アイコン画像とラベル)
const facilities: { key: FacilityKey; name: string; icon: string }[] = [
  { key: "parking", name: "駐車場", icon: "/parkInfo/P.svg" },
  { key: "toilet", name: "トイレ", icon: "/parkInfo/WC.svg" },
  { key: "food", name: "食事", icon: "/parkInfo/food.svg" },
  { key: "gasStation", name: "給油", icon: "/parkInfo/gasStation.svg" },
  { key: "info", name: "案内所", icon: "/parkInfo/info.svg" },
  { key: "bed", name: "仮眠", icon: "/parkInfo/bed.svg" },
];

type FacilityIconsProps = {
  facilities: Record<FacilityKey, boolean>;
};

function FacilityIcons({ facilities: availability }: FacilityIconsProps) {
  return (
    // 施設アイコン行
    <div className="flex gap-4 px-4 py-2 border-b border-gray-200">
      {facilities.map((facility) => {
        const isAvailable = availability[facility.key];
        return (
          <div
            key={facility.key}
            title={facility.name}
            // アイコン画像は元の色を持つため、mask-imageで形だけ抜き出して
            // ある場合はsky-400、ない場合はグレー+半透明で塗り分ける
            className={`h-5 w-5 ${
              isAvailable ? "bg-sky-400" : "bg-gray-400 opacity-40"
            }`}
            style={{
              maskImage: `url(${facility.icon})`,
              maskRepeat: "no-repeat",
              maskSize: "contain",
              maskPosition: "center",
              WebkitMaskImage: `url(${facility.icon})`,
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              WebkitMaskPosition: "center",
            }}
          />
        );
      })}
    </div>
  );
}

export default FacilityIcons;
