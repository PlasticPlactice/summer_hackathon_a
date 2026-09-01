import SaInfoBar from "./saInfoBar";
import DirectionToggle from "./directionToggle";
import CapacitySummary from "./capacitySummary";
import FacilityIcons, { FacilityKey } from "./facilityIcons";
import StatusLegend from "./statusLegend";

type VehicleCount = {
  large: number;
  small: number;
};

type ParkInfoProps = {
  saName: string;
  direction: "up" | "down";
  capacity: VehicleCount;
  available: VehicleCount;
  facilities: Record<FacilityKey, boolean>;
};

function ParkInfo({ saName, direction, capacity, available, facilities }: ParkInfoProps) {
  return (
    <div className="parkInfo flex flex-col">
      {/* SA情報バー */}
      <div className="flex flex-col gap-2.5 p-4 border-b border-gray-200">
        <SaInfoBar saName={saName} />
        {/* 上り/下り切替 */}
        <DirectionToggle direction={direction} />
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
