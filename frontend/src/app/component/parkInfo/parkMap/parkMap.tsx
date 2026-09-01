import ParkLine, { ParkRow } from "./parkLine";

interface ParkMapProps {
    rows: ParkRow[];
    flipped?: boolean; // trueの場合、マップ全体を上下左右反転する(下り表示用)
}

function ParkMap({ rows, flipped = false }: ParkMapProps){
    // 反転時、マップ全体はrotate-180で上下左右反転させるが、
    // 文字要素だけはさらにrotate-180を重ねて打ち消し、常に正しく読める向きにする
    const textFlip = flipped ? "rotate-180" : "";
    // 「本線」の矢印はvertical-rlで90度回転して表示されるため、
    // 下り(flipped)では矢印を左向きにして上向き表示に切り替える(文字自体は反転させない)
    const roadArrow = flipped ? "←" : "→";
    return(
        // スクロールコンテナ:幅は親要素基準にし、はみ出た中身を横スクロールさせる
        <div className="w-full overflow-x-scroll">
            {/* コンテンツ本体:こちらに固定幅を持たせることでコンテナからはみ出させる */}
            <div className={`flex w-175 bg-blue-200 ${flipped ? "rotate-180" : ""}`}>
                {/* 駐車場全体 */}
                <div className="w-[88%] bg-gray-50 h-180 flex-none">
                    {/* 草 */}
                    <div className="bg-green-400 h-16"></div>
                    <div className="flex w-full h-164">
                        {/* SA */}
                        <div className="w-12 bg-indigo-400">
                            <p className={`text-white text-center font-bold my-auto ${textFlip}`}>SA</p>
                        </div>
                        <div className="w-full bg-stone-300">
                            {/* 駐車場 */}
                            <div>
                                {rows.map((row, index) => (
                                    <ParkLine key={index} type={row.type} slots={row.slots} flipped={flipped} />
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
                        <p className={`text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3 ${textFlip}`}>{roadArrow}　本線　{roadArrow}</p>
                        <p className={`text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3 ${textFlip}`}>{roadArrow}　本線　{roadArrow}</p>
                        <p className={`text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-3 ${textFlip}`}>{roadArrow}　本線　{roadArrow}</p>
                    </div>
                    {/* ガソリンスタンド */}
                    <div className="w-[40%] h-full ">
                        {/* ガソリンスタンドまでの空白 */}
                        <div className="w-full h-[45%] bg-green-400"></div>
                        <div>
                            <p className={`text-white font-bold text-center mt-24 [writing-mode:vertical-rl] ml-0.5 ${textFlip}`}>ガソリンスタンド</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ParkMap;