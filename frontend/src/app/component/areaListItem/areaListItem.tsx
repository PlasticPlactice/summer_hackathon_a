import AreaListContent from "./areaListContent";
import { calcOccupiedByType } from "./calcOccupiedByType";
import { ParkingStatus } from "../../../types/parking";

type AreaListItemProps = {
    color: string;
    parking: ParkingStatus;
}

export default function AreaListItem({ color, parking }: AreaListItemProps) {
    const occupied = calcOccupiedByType(parking.spaces);
    return (
        <div className="area-list-item flex flex-col gap-2 p-4 outline-5 rounded-sm w-43" style={{ outlineColor: color }}>
            <h1 className="text-base text-center">{parking.name}</h1>
            <AreaListContent title="駐車可能台数" small={parking.compact_capacity} large={parking.large_capacity}/>
            <AreaListContent title="現在の利用台数" small={occupied.compact} large={occupied.large}/>
        </div>
    )

}
