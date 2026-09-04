"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "../confirmModal/confirmModal";
import Pagination from "../pagination/pagination";
import { ParkingStatus, Sensor } from "../../../types/parking";

// 1ページに表示する件数
const PAGE_SIZE = 10;

type SensorListClientProps = {
  initialSensors: Sensor[];
  parkings: ParkingStatus[];
};

type LinkedLocation = {
  parkingName: string;
  parkingId: number;
  parkingNumber: number;
};

// センサーIDごとに、紐付いているパーキング名・スペース番号を求める
function buildLocationMap(parkings: ParkingStatus[]): Map<number, LinkedLocation> {
  const map = new Map<number, LinkedLocation>();
  for (const parking of parkings) {
    for (const space of parking.spaces) {
      if (space.sensor_id !== null) {
        map.set(space.sensor_id, {
          parkingName: parking.name,
          parkingId: parking.id,
          parkingNumber: space.parking_number,
        });
      }
    }
  }
  return map;
}

export default function SensorListClient({ initialSensors, parkings }: SensorListClientProps) {
  const router = useRouter();
  const [sensors, setSensors] = useState(initialSensors);
  const [newDeviceId, setNewDeviceId] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // 編集中のセンサー
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingDeviceId, setEditingDeviceId] = useState("");
  const [editingStatus, setEditingStatus] = useState(0);

  // 削除確認モーダルの対象(nullなら非表示)
  const [deleteTarget, setDeleteTarget] = useState<Sensor | null>(null);

  // 現在のページ番号
  const [currentPage, setCurrentPage] = useState(1);

  const locationMap = useMemo(() => buildLocationMap(parkings), [parkings]);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  // 最新のセンサー一覧を取得し直す(パーキング側の紐付け状況はページ遷移時にサーバー側で再取得される)
  const refreshSensors = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/sensors`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      setSensors((await res.json()) as Sensor[]);
    } catch (error) {
      console.error("センサー一覧の再取得中にエラーが発生しました", error);
    }
  };

  // 新規センサーを登録する
  const handleCreate = async () => {
    if (newDeviceId.trim() === "" || busy) return;
    setErrorMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/sensors`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: newDeviceId.trim(), status: 0 }),
      });
      if (!res.ok) {
        console.error(`センサーの登録に失敗しました: ${res.status}`);
        setErrorMessage("センサーの登録に失敗しました。デバイスIDが重複していないか確認してください。");
        return;
      }
      setNewDeviceId("");
      await refreshSensors();
      setCurrentPage(1);
    } catch (error) {
      console.error("センサーの登録中にエラーが発生しました", error);
      setErrorMessage("センサーの登録中にエラーが発生しました。通信環境を確認して再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  // 編集を開始する
  const startEdit = (sensor: Sensor) => {
    setEditingId(sensor.id);
    setEditingDeviceId(sensor.device_id);
    setEditingStatus(sensor.status);
    setErrorMessage(null);
  };

  // センサー情報を更新する
  const handleUpdate = async (sensorId: number) => {
    if (editingDeviceId.trim() === "" || busy) return;
    setErrorMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/sensors/${sensorId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: editingDeviceId.trim(), status: editingStatus }),
      });
      if (!res.ok) {
        console.error(`センサー情報の更新に失敗しました: ${res.status}`);
        setErrorMessage("センサー情報の更新に失敗しました。デバイスIDが重複していないか確認してください。");
        return;
      }
      setEditingId(null);
      await refreshSensors();
    } catch (error) {
      console.error("センサー情報の更新中にエラーが発生しました", error);
      setErrorMessage("センサー情報の更新中にエラーが発生しました。通信環境を確認して再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  // センサーを削除する(紐付き中の場合、バックエンド側でスペースの紐付けも自動的に解除される)
  const handleConfirmDelete = async () => {
    if (!deleteTarget || busy) return;
    setErrorMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/sensors/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        console.error(`センサーの削除に失敗しました: ${res.status}`);
        setErrorMessage("センサーの削除に失敗しました。");
        return;
      }
      setDeleteTarget(null);
      await refreshSensors();
    } catch (error) {
      console.error("センサーの削除中にエラーが発生しました", error);
      setErrorMessage("センサーの削除中にエラーが発生しました。通信環境を確認して再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sensors.length / PAGE_SIZE));
  // 削除等でページ数が減った場合に範囲外にならないよう補正する
  const safePage = Math.min(currentPage, totalPages);
  const pagedSensors = sensors.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="flex w-full max-w-[390px] flex-col gap-5">
      {/* 新規登録 */}
      <section className="flex flex-col gap-3 px-4">
        <h2 className="text-base text-black">センサーの新規登録</h2>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newDeviceId}
            onChange={(e) => setNewDeviceId(e.target.value)}
            placeholder="デバイスID"
            className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={newDeviceId.trim() === "" || busy}
            className="h-[32px] shrink-0 cursor-pointer rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            登録
          </button>
        </div>
      </section>

      {errorMessage && <p className="px-4 text-xs text-red-500">{errorMessage}</p>}

      {/* 一覧 */}
      <section className="flex flex-col gap-3 px-4">
        <h2 className="text-base text-black">登録済みセンサー一覧</h2>
        {sensors.length === 0 ? (
          <p className="text-xs text-gray-500">登録されているセンサーがありません</p>
        ) : (
          pagedSensors.map((sensor) => {
            const location = locationMap.get(sensor.id);
            const isEditing = editingId === sensor.id;
            return (
              <div key={sensor.id} className="flex flex-col gap-2 rounded-[5px] border border-[#d9d9d9] p-3">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={editingDeviceId}
                      onChange={(e) => setEditingDeviceId(e.target.value)}
                      className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black"
                    />
                    <select
                      value={editingStatus}
                      onChange={(e) => setEditingStatus(Number(e.target.value))}
                      className="w-full rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black"
                    >
                      <option value={0}>空車</option>
                      <option value={1}>満車</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdate(sensor.id)}
                        disabled={editingDeviceId.trim() === "" || busy}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        保存
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={busy}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#a1a1a1] bg-white px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                      >
                        キャンセル
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-black">{sensor.device_id}</p>
                      <span
                        className="text-xs font-bold"
                        style={{ color: sensor.status === 0 ? "#3cae00" : "#e20000" }}
                      >
                        {sensor.status === 0 ? "空車" : "満車"}
                      </span>
                    </div>
                    <p className="text-xs text-[#a1a1a1]">
                      最終検知:{" "}
                      {sensor.last_sens_at ? new Date(sensor.last_sens_at).toLocaleString("ja-JP") : "未検知"}
                    </p>
                    <p className="text-xs text-black">
                      紐付け先:{" "}
                      {location ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/parkList/${location.parkingId}/sensors`)}
                          className="cursor-pointer text-[#0095ff] underline"
                        >
                          {location.parkingName}（{location.parkingNumber}番）
                        </button>
                      ) : (
                        "未使用"
                      )}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(sensor)}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#cfbe00] bg-[#fbf7cd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(sensor)}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#e20000] bg-[#fbcdcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        削除
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
        <Pagination currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </section>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="センサーの削除"
        message={
          deleteTarget
            ? (() => {
                const location = locationMap.get(deleteTarget.id);
                const linkedNote = location
                  ? `「${location.parkingName}（${location.parkingNumber}番）」との紐付けも自動的に解除されます。`
                  : "";
                return `「${deleteTarget.device_id}」を削除します。${linkedNote}この操作は取り消せません。よろしいですか?`;
              })()
            : ""
        }
        isProcessing={busy}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
