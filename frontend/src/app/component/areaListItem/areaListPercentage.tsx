type PercentageProps = {
    rate: number;
}

// 満車率に応じて色を返す関数
function getColorClass(rate: number): string {
  if (rate >= 90) return '#FF4E51';
  if (rate >= 60) return '#FFBC4C';
  return '#4EFA4D';
}

export default function Percentage({ rate }: PercentageProps) {
    return (
        <div className="h-2 rounded-full w-full" style={{ backgroundColor: "#E0E0E0" }}>
            <div
                className={`h-full rounded-full transition-all duration-300`}
                style={{ width: `${rate}%`, backgroundColor: getColorClass(rate) }}
            />
        </div>
    )

}
