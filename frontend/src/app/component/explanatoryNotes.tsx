type ExplanatoryNotesProps = {
    label: string;
    color: string;
}

export default function ExplanatoryNotes({ label, color }: ExplanatoryNotesProps) {
    return (
        <div className="note flex gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm border-3" style={{ borderColor: color }}></div>
          <p className="text-xs">{label}</p>
        </div>
    )

}
