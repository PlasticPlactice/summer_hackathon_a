import Image from 'next/image';
import Percentage from './areaListPercentage';

type AreaListContentProps = {
    title: string;
    totalNum: number;
    useNum: number;
    imgSrc: string;
}

export default function AreaListContent({ title, totalNum, useNum, imgSrc }: AreaListContentProps) {
    return (
        <div className="area-list-content flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 items-center justify-center">
                    <Image src={imgSrc} alt="large car icon" className="w-4 h-4" width={16} height={16}/>
                    <h1 className="text-sm text-center">{title}</h1>
                </div>
                <p className="text-xs">{useNum}/{totalNum}台</p>
            </div>
            {/* パーセンテージ */}
            <Percentage rate={(useNum / totalNum) * 100}/>
        </div>
    )

}
