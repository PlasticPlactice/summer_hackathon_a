import Link from "next/link";
import AreaListContent from "./areaListContent";
import { calcOccupiedByType } from "./calcOccupiedByType";
import { ParkingStatus } from "../../../types/parking";

type AreaListItemProps = {
    parking: ParkingStatus;
    parkingTotalNumLarge: number;
    parkingTotalNumsmall: number;
}

// 満車率に応じて色を返す関数
function getColorClass(rate: number): string {
  if (rate >= 90) return '#FF4E51';
  if (rate >= 60) return '#FFBC4C';
  return '#4EFA4D';
}

export default function AreaListItem({ parking,parkingTotalNumLarge,parkingTotalNumsmall }: AreaListItemProps) {
    const occupied = calcOccupiedByType(parking.spaces);
    const rate = (occupied.compact + occupied.large) / (parkingTotalNumsmall + parkingTotalNumLarge) * 100;
    return (
            <Link href={`/parkInfo?parkingId=${parking.id}`} className="area-list-item flex flex-col gap-2 p-4 outline-5 rounded-sm" style={{ outlineColor: getColorClass(rate) }}>
            <div className="flex justify-between items-center">
                <h2 className="text-base">{parking.name}</h2>
                <div className="flex gap-2 items-center">
                    <h2 className="text-xs" style={{ color: "#A19E9E" }}>満車率</h2>
                    <h2 className="text-sm ">{Math.round(rate)}%</h2>
                </div>
            </div>
            <AreaListContent title="大型車" totalNum={parkingTotalNumLarge} useNum={occupied.large} imgSrc="/track.svg" />
            <AreaListContent title="小型車" totalNum={parkingTotalNumsmall} useNum={occupied.compact} imgSrc="/car.svg" />
        </Link>
    )

}
