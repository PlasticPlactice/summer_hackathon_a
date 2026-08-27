import ExplanatoryNotes from "./component/explanatoryNotes";
import AreaListItem from "./component/areaListItem/areaListItem";

export default function Home() {
  return (
    <main className="p-4 flex flex-col gap-4">
      {/* 検索 */}
      <div className="search flex flex-col gap-4">
        {/* エリア種別の選択 */}
        <div className="type-selection flex flex-col gap-2">
          <h3 className="text-xs font-bold">エリア種別</h3>
          <select className="type-select text-xs border rounded-sm p-1 border-gray-300 w-24">
            <option value="none">指定なし</option>
            <option value="SA">SA</option>
            <option value="PA">PA</option>
          </select>
        </div>
        {/* エリア名入力 */}
        <div className="search-box flex flex-col gap-2">
          <h3 className="text-xs font-bold">エリア名</h3>
          <div className="search-container flex items-center">
            <input
              type="text"
              className="search-input text-xs border  rounded-tl-sm rounded-bl-sm p-1 border-gray-300 container flex-1 px-4 py-2 h-8"
              placeholder="エリア名を入力してください"
            />
            <button
            className="bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition-colors rounded-tr-sm rounded-br-sm h-8 text-xs">
              検索
            </button>
          </div>
        </div>
      </div>
      {/* 凡例 */}
      <div className="explanatory-notes flex gap-5">
        <ExplanatoryNotes label="空き" color="#80FFEC" />
        <ExplanatoryNotes label="混雑" color="#FFBC4C" />
        <ExplanatoryNotes label="満車" color="#FF4E51" />
      </div>
      {/* エリア一覧 */}
      <div className="area-list flex flex-wrap justify-between gap-5">
        <AreaListItem title="前沢SA" color="#FFBC4C" parkingTotalNumLarge={48} parkingTotalNumsmall={158} parkingUsedNumLarge={20} parkingUsedNumsmall={74}/>
        <AreaListItem title="前沢SA" color="#FFBC4C" parkingTotalNumLarge={48} parkingTotalNumsmall={158} parkingUsedNumLarge={20} parkingUsedNumsmall={74}/>
        <AreaListItem title="前沢SA" color="#FFBC4C" parkingTotalNumLarge={48} parkingTotalNumsmall={158} parkingUsedNumLarge={20} parkingUsedNumsmall={74}/>
        <AreaListItem title="前沢SA" color="#FFBC4C" parkingTotalNumLarge={48} parkingTotalNumsmall={158} parkingUsedNumLarge={20} parkingUsedNumsmall={74}/>
      </div>
    </main>
  );
}
