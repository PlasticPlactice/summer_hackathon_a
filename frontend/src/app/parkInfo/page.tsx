import ParkInfo from "../component/parkInfo/parkInfo";

// SA名、駐車場規模と現在の空き台数(車種別)
const saName = "前沢SA";
const capacity = { large: 26, small: 79 };
const available = { large: 14, small: 65 };

// SAごとの設置施設の有無(将来複数SA/PAを扱う際はSAごとにこの設定を用意する)
const facilities = {
  parking: true,
  toilet: true,
  food: true,
  gasStation: true,
  info: true,
  bed: false,
};

export default function ParkInfoPage() {
  return (
    <main>
      <ParkInfo
        saName={saName}
        capacity={capacity}
        available={available}
        facilities={facilities}
      />
    </main>
  );
}