import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import AreaListContent from "./areaListContent";
import { calcOccupiedByType } from "./calcOccupiedByType";
import { ParkingStatus } from "../../../types/parking";

type AreaListItemProps = {
    parking: ParkingStatus;
    parkingTotalNumLarge: number;
    parkingTotalNumsmall: number;
    // 管理者向け操作(編集・削除ボタン)を表示するかどうか。省略時は一般利用者向けの表示のまま
    isAdmin?: boolean;
    onDeleteRequest?: (parking: ParkingStatus) => void;
}

// 満車率に応じて色を返す関数
function getColorClass(rate: number): string {
  if (rate >= 90) return '#FF4E51';
  if (rate >= 60) return '#FFBC4C';
  return '#4EFA4D';
}

export default function AreaListItem({ parking, parkingTotalNumLarge, parkingTotalNumsmall, isAdmin = false, onDeleteRequest }: AreaListItemProps) {
    const router = useRouter();
    const occupied = calcOccupiedByType(parking.spaces);
    const rate = (occupied.compact + occupied.large) / (parkingTotalNumsmall + parkingTotalNumLarge) * 100;

    // カード全体がLinkのため、編集・削除・センサー管理ボタン押下時はカードの遷移(/parkInfo)を発火させない
    const handleEditClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/admin/parkList/${parking.id}/edit`);
    };

    const handleDeleteClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDeleteRequest?.(parking);
    };

    const handleSensorClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/admin/parkList/${parking.id}/sensors`);
    };

    return (
            <Link
                href={`/parkInfo?parkingId=${parking.id}${isAdmin ? "&from=admin" : ""}`}
                className="area-list-item relative flex flex-col gap-2 p-4 outline-5 rounded-sm"
                style={{ outlineColor: getColorClass(rate) }}
            >
            <div className="flex justify-between items-center">
                <h2 className="text-base">{parking.name}</h2>
                <div className="flex gap-2 items-center">
                    <h2 className="text-xs" style={{ color: "#A19E9E" }}>満車率</h2>
                    <h2 className="text-sm ">{Math.round(rate)}%</h2>
                </div>
            </div>
            <AreaListContent title="大型車" totalNum={parkingTotalNumLarge} useNum={occupied.large} imgSrc="/track.svg" />
            <AreaListContent title="小型車" totalNum={parkingTotalNumsmall} useNum={occupied.compact} imgSrc="/car.svg" />
            {isAdmin && (
                <div className="mt-1 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleSensorClick}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#0095ff] bg-[#cde9fb] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                    >
                        センサー管理
                    </button>
                    <button
                        type="button"
                        onClick={handleEditClick}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#0095ff] bg-white px-3 text-xs font-bold text-[#0095ff] transition-opacity hover:opacity-90"
                    >
                        編集
                    </button>
                    <button
                        type="button"
                        onClick={handleDeleteClick}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#e20000] bg-[#fbcdcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                    >
                        削除
                    </button>
                </div>
            )}
        </Link>
    )

}
