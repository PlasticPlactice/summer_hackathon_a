function StatusLegend() {
  return (
    // 空き/満車の凡例
    <div className="flex gap-5 px-4 py-2">
      <div className="flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-sm border-2 border-[#3cff00] bg-[#d5fbcd]" />
        <span className="text-xs text-gray-600">空き</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-3.5 w-3.5 rounded-sm border-2 border-[#ff4e51] bg-[#fbcdcd]" />
        <span className="text-xs text-gray-600">満車</span>
      </div>
    </div>
  );
}

export default StatusLegend;
