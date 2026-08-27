import Image from "next/image";

type VehicleCountRowProps = {
  label: string;
  large: number;
  small: number;
};

function VehicleCountRow({ label, large, small }: VehicleCountRowProps) {
  return (
    // 大型/小型の台数を1行で表示
    <div className="flex flex-col items-center gap-1">
      <p className="text-xs">{label}</p>
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1">
          <Image src="/track.svg" alt="大型" width={20} height={20} />
          {large}台
        </span>
        <span className="flex items-center gap-1">
          <Image src="/car.svg" alt="小型" width={20} height={20} />
          {small}台
        </span>
      </div>
    </div>
  );
}

export default VehicleCountRow;
