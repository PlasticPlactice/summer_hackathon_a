import Image from "next/image";

function TitleIcon(){
    return(
        // アプリアイコン
        <div className="w-12 h-12 py-0.5 bg-white rounded-sm text-center items-baseline shadow-xs shadow-olive-400">
            {/* 文字部分 */}
            <div className="text-center">
                <p className="text-xs text-sky-400 font-bold"><span className="text-xl">P</span> Now</p>
            </div>
            {/* 画像部分 */}
            <div className="w-10 h-3 flex justify-center items-center mx-auto">
                <Image src="/car_header.png" alt="App Icon" width={40} height={40} />
            </div>
        </div>
    )
}

export default TitleIcon;