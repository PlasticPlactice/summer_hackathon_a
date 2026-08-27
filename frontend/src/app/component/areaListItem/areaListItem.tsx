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
        <div className="area-list-item flex flex-col gap-2 p-4 outline-5 rounded-sm w-43" style={{ outlineColor: color }}>
            <h1 className="text-base text-center">{title}</h1>
            <AreaListContent title="駐車可能台数" small={parkingTotalNumsmall} large={parkingTotalNumLarge}/>
            <AreaListContent title="現在の利用台数" small={parkingUsedNumsmall} large={parkingUsedNumLarge}/>
        </div>
    )

}
