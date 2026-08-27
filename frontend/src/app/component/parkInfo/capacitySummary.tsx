import VehicleCountRow from "./vehicleCountRow";

type VehicleCount = {
  large: number;
  small: number;
};

type CapacitySummaryProps = {
  capacity: VehicleCount;
  available: VehicleCount;
};

function CapacitySummary({ capacity, available }: CapacitySummaryProps) {
  return (
    // 駐車場規模と現在の空き台数のサマリー
    <div className="flex items-center justify-between gap-8">
      <VehicleCountRow
        label="駐車場規模"
        large={capacity.large}
        small={capacity.small}
      />
      <VehicleCountRow
        label="現在の駐車可能台数"
        large={available.large}
        small={available.small}
      />
    </div>
  );
}

export default CapacitySummary;
