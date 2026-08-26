

export default function Home() {
  return (
    <main>
      <div className="search flex-col">
        <div className="type-selection flex-col items-center gap-2">
          <h3 className="text-xs font-bold">エリア種別</h3>
          <select className="type-select text-xs border rounded-sm p-1 border-gray-300 ">
            <option value="none">指定なし</option>
            <option value="SA">SA</option>
            <option value="PA">PA</option>
          </select>
        </div>
        <div className="search-box flex-col items-center gap-2">
          <h3 className="text-xs font-bold">エリア名</h3>
          <div className="search-container flex items-center">
            <input
              type="text"
              className="search-input text-xs border rounded-sm p-1 border-gray-300 container flex-1 px-4 py-2"
              placeholder="エリア名を入力してください"
            />
            <button
            className="bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition-colors rounded-tr-lg rounded-br-lg">
              検索
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
