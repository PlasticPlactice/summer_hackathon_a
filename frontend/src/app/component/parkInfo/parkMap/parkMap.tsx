import ParkLine, { ParkRow } from "./parkLine";

interface ParkMapProps {
    rows: ParkRow[];
}

function ParkMap({ rows }: ParkMapProps){
    return(
        // スクロールコンテナ:幅は親要素基準にし、はみ出た中身を横スクロールさせる
        <div className="w-full overflow-x-scroll">
            {/* コンテンツ本体:こちらに固定幅を持たせることでコンテナからはみ出させる */}
            <div className="flex w-175 bg-blue-200">
                {/* 駐車場全体 */}
                <div className="w-[88%] bg-gray-50 h-180 flex-none">
                    {/* 草 */}
                    <div className="bg-green-400 h-16"></div>
                    <div className="flex w-full h-164">
                        {/* SA */}
                        <div className="w-12 bg-indigo-400">
                            <p className="text-white text-center font-bold my-auto">SA</p>
                        </div>
                        <div className="w-full bg-stone-300">
                            {/* 駐車場 */}
                            <div>
                                {rows.map((row, index) => (
                                    <ParkLine key={index} type={row.type} slots={row.slots} />
                                ))}
                            </div>
                            {/* 駐車場の道路 */}
                            {/* <ParkingRoad /> */}
                        </div>
                    </div>
                </div>
                {/* 本線から */}
                <div className="w-[12%] flex">
                    {/* 本線からの道路 */}
                    <div className="w-[70%] bg-stone-300 border-x-2 border-stone-200">
                        <p className="text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3">→　本線　→</p>
                        <p className="text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3">→　本線　→</p>
                        <p className="text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3">→　本線　→</p>
                    </div>
                    {/* ガソリンスタンド */}
                    <div className="w-[40%] h-full ">
                        {/* ガソリンスタンドまでの空白 */}
                        <div className="w-full h-[45%] bg-green-400"></div>
                        <div>
                            <p className="text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-0.5">ガソリンスタンド</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ParkMap;