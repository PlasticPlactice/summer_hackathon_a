import Image from 'next/image';

type AreaListContentProps = {
    title: string;
    small: number;
    large: number;
}

export default function AreaListContent({ title, small, large}: AreaListContentProps) {
    return (
        <div className="area-list-content flex flex-col gap-1">
            <h1 className="text-sm text-center">{title}</h1>
            <div className="parking-info flex gap-4 items-center justify-center">
                <div className="large flex gap-0.5">
                    <Image src="/track2.png" alt="large car icon" className="w-4 h-4" width={16} height={16}/>
                    <p className="text-xs">{large}台</p>
                </div>
                <div className="small flex gap-0.5">
                    <Image src="/car2.png" alt="large car icon" className="w-4 h-4" width={16} height={16}/>
                    <p className="text-xs">{small}台</p>
                </div>
            </div>
        </div>
    )

}
