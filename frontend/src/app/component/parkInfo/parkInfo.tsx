import Link from "next/link";
import SaInfoBar from "./saInfoBar";
import CapacitySummary from "./capacitySummary";
import FacilityIcons, { FacilityKey } from "./facilityIcons";
import StatusLegend from "./statusLegend";

type VehicleCount = {
  large: number;
  small: number;
};

type ParkInfoProps = {
  saName: string;
  capacity: VehicleCount;
  available: VehicleCount;
  facilities: Record<FacilityKey, boolean>;
};

function ParkInfo({ saName, capacity, available, facilities }: ParkInfoProps) {
  return (
    <div className="parkInfo flex flex-col">
      {/* 戻るボタン */}
      <Link href="/parkList" className="flex items-center gap-2 px-4 py-3 text-black">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-xs">戻る</span>
      </Link>

      {/* SA情報バー */}
      <div className="flex flex-col gap-2.5 p-4 border-b border-gray-200">
        <SaInfoBar saName={saName} />
        {/* 台数サマリー */}
        <CapacitySummary capacity={capacity} available={available} />
      </div>

      {/* 施設アイコン行 */}
      <FacilityIcons facilities={facilities} />

      {/* 空き/満車の凡例 */}
      <StatusLegend />
    </div>
  );
}

export default ParkInfo;
