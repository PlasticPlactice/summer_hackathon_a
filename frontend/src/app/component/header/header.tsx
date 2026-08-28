import TitleIcon from "./titleIcon";
import TitleText from "./titleText";
import Image from 'next/image';


function Header(){
    return(
        <div className="h-20 flex border-b-4 items-center justify-between box-border bg-white px-1" style={{borderColor: "#FF4E51"}}>

            <Image src="/header_track.png" alt="ParkNow logo" width={100} height={40} style={{marginBottom: "-40px"}}/>
            <div className="flex gap-2 items-center">
                {/* アイコン部分 */}
                <TitleIcon />
                {/* タイトル部分 */}
                <TitleText />
            </div>
            <Image src="/header_icon.png" alt="ParkNow logo" width={100} height={40} style={{marginBottom: "-45px"}}/>
        </div>
    )
}

export default Header;
