import TitleIcon from "./titleIcon";
import TitleText from "./titleText";


function Header(){
    return(
        <div className="h-20 flex bg-sky-400 items-center px-4">
            {/* アイコン部分 */}
            <TitleIcon />
            {/* タイトル部分 */}
            <TitleText />
        </div>
    )
}

export default Header;