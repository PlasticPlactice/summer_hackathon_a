import BaseScreen from "./componets/baseScreen";
import Header from "./componets/header/header";

export default function Home() {
  return (
    <div className="bg-green-50">
      <BaseScreen>
        <Header />
        <main className="p-4">
          <div className="search flex flex-col gap-4">
            <div className="type-selection flex flex-col gap-2">
              <h3 className="text-xs font-bold">エリア種別</h3>
              <select className="type-select text-xs border rounded-sm p-1 border-gray-300 w-24">
                <option value="none">指定なし</option>
                <option value="SA">SA</option>
                <option value="PA">PA</option>
              </select>
            </div>
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
        </main>
      </BaseScreen>
    </div>
  );
}
