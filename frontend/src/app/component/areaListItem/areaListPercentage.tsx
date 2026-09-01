type PercentageProps = {
    rate: number;
}

function getColorClass(rate: number): string {
  if (rate >= 90) return '#FF4E51';
  if (rate >= 70) return '#FFBC4C';
  return '#80FFEC';
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
