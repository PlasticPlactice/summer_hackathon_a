import Image from 'next/image';

function TitleIcon(){
    return(
        // アプリアイコン
        <div className="h-10 py-0.5 bg-white rounded-sm text-center items-baseline drop-shadow-md p-0.5">
            <div className="flex gap-0.5 h-6">
                <p className="text-lg font-bold " style={{color: "#0095FF", marginTop: "-5px"}}>P</p>
                <p className="text-xs font-bold text-end" style={{color: "#0095FF", marginTop: "3px"}}>Now</p>
            </div>
            <Image src="/header_car.png" alt="ParkNow icon" width={40} height={40}/>
        </div>
    )
}

export default TitleIcon;
