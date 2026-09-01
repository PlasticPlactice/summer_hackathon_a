import AreaListContent from "./areaListContent";

type AreaListItemProps = {
    title: string;
    color: string;
    parkingTotalNumLarge: number;
    parkingTotalNumsmall: number;
    parkingUsedNumLarge: number;
    parkingUsedNumsmall: number;
}

export default function AreaListItem({ title, color,parkingTotalNumLarge,parkingTotalNumsmall,parkingUsedNumLarge,parkingUsedNumsmall}: AreaListItemProps) {
    return (
        <div className="area-list-item flex flex-col gap-2 p-4 outline-5 rounded-sm" style={{ outlineColor: color }}>
            <div className="flex justify-between items-center">
                <h2 className="text-base">{title}</h2>
                <div className="flex gap-2 items-center">
                    <h2 className="text-xs" style={{ color: "#A19E9E" }}>満車率</h2>
                    <h2 className="text-sm ">{Math.round((parkingUsedNumsmall + parkingUsedNumLarge) / (parkingTotalNumsmall + parkingTotalNumLarge) * 100)}%</h2>
                </div>
            </div>
            <AreaListContent title="大型車" totalNum={parkingTotalNumLarge} useNum={parkingUsedNumLarge} imgSrc="/track.svg" />
            <AreaListContent title="小型車" totalNum={parkingTotalNumsmall} useNum={parkingUsedNumsmall} imgSrc="/car.svg" />
        </div>
    )

}
