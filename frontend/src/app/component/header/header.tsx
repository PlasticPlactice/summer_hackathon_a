import Image from "next/image";
import TitleIcon from "./titleIcon";
import TitleText from "./titleText";


function Header(){
    return(
        <div className="h-20 flex justify-between bg-white px-4 border-b-5 border-red-500">
            <div className="flex items-end">
                <Image src="/track_header.png" alt="track_img" width={80} height={80} />
            </div>
            <div className="flex items-center ml-2">
                {/* アイコン部分 */}
                <TitleIcon />
                {/* タイトル部分 */}
                <TitleText />
            </div>
            <div className="flex items-end">
                <Image src="/car_header.png" alt="car_img" width={80} height={80} />
            </div>
        </div>
    )
}

export default Header;