"use client";

import { useMemo, useState } from "react";
import { ParkingSpace, Sensor } from "../../../types/parking";

type SpaceSensorAssignClientProps = {
  parkingId: number;
  parkingName: string;
  initialSpaces: ParkingSpace[];
  initialSensors: Sensor[];
  // 既に何らかのスペースに紐付いているセンサーID一覧(このパーキング内外を問わず)
  initialUsedSensorIds: number[];
};

type AssignMode = "existing" | "new";

const typeLabel: Record<string, string> = {
  compact: "小型",
  large: "大型",
};

export default function SpaceSensorAssignClient({
  parkingId,
  parkingName,
  initialSpaces,
  initialSensors,
  initialUsedSensorIds,
}: SpaceSensorAssignClientProps) {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [sensors, setSensors] = useState(initialSensors);
  const [usedSensorIds, setUsedSensorIds] = useState<Set<number>>(new Set(initialUsedSensorIds));

  // 紐付けフォームを開いているスペースID(nullなら非表示)
  const [openSpaceId, setOpenSpaceId] = useState<number | null>(null);
  const [assignMode, setAssignMode] = useState<AssignMode>("existing");
  const [selectedSensorId, setSelectedSensorId] = useState("");
  const [newDeviceId, setNewDeviceId] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const sensorsById = useMemo(() => new Map(sensors.map((s) => [s.id, s])), [sensors]);
  // まだどのスペースにも紐付いていないセンサー(紐付け候補)
  const availableSensors = useMemo(
    () => sensors.filter((s) => !usedSensorIds.has(s.id)),
    [sensors, usedSensorIds],
  );

  // このパーキングの最新状況・センサー一覧・利用可否を取得し直す
  const refreshAll = async () => {
    try {
      const [parkingRes, sensorsRes, spacesRes] = await Promise.all([
        fetch(`${apiBaseUrl}/api/v1/parkings/${parkingId}`, {
          cache: "no-store",
          credentials: "include",
        }),
        fetch(`${apiBaseUrl}/api/v1/sensors`, {
          cache: "no-store",
          credentials: "include",
        }),
        fetch(`${apiBaseUrl}/api/v1/spaces`, {
          cache: "no-store",
          credentials: "include",
        }),
      ]);

      if (parkingRes.ok) {
        const parking = await parkingRes.json();
        setSpaces(parking.spaces as ParkingSpace[]);
      }
      if (sensorsRes.ok) {
        setSensors((await sensorsRes.json()) as Sensor[]);
      }
      if (spacesRes.ok) {
        const allSpaces = (await spacesRes.json()) as ParkingSpace[];
        setUsedSensorIds(
          new Set(allSpaces.filter((s) => s.sensor_id !== null).map((s) => s.sensor_id as number)),
        );
      }
    } catch (error) {
      console.error("センサー紐付け状況の再取得中にエラーが発生しました", error);
    }
  };

  const closeForm = () => {
    setOpenSpaceId(null);
    setAssignMode("existing");
    setSelectedSensorId("");
    setNewDeviceId("");
  };

  const openForm = (spaceId: number) => {
    setOpenSpaceId(spaceId);
    setAssignMode(availableSensors.length > 0 ? "existing" : "new");
    setSelectedSensorId("");
    setNewDeviceId("");
    setErrorMessage(null);
  };

  // 選択済みの既存センサーをスペースへ紐付ける
  const linkSensorToSpace = async (spaceId: number, sensorId: number) => {
    const res = await fetch(`${apiBaseUrl}/api/v1/spaces/${spaceId}/sensor`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sensor_id: sensorId }),
    });
    return res.ok;
  };

  // 紐付けフォームの内容(既存選択 or 新規登録)でスペースにセンサーを紐付ける
  const handleAssign = async (spaceId: number) => {
    if (busy) return;
    setErrorMessage(null);

    if (assignMode === "existing") {
      if (selectedSensorId === "") return;
      setBusy(true);
      try {
        const ok = await linkSensorToSpace(spaceId, Number(selectedSensorId));
        if (!ok) {
          setErrorMessage("センサーの紐付けに失敗しました。");
          return;
        }
        closeForm();
        await refreshAll();
      } catch (error) {
        console.error("センサーの紐付け中にエラーが発生しました", error);
        setErrorMessage("センサーの紐付け中にエラーが発生しました。通信環境を確認して再度お試しください。");
      } finally {
        setBusy(false);
      }
      return;
    }

    // 新規センサー登録 + 紐付け
    if (newDeviceId.trim() === "") return;
    setBusy(true);
    try {
      const createRes = await fetch(`${apiBaseUrl}/api/v1/sensors`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_id: newDeviceId.trim(), status: 0 }),
      });
      if (!createRes.ok) {
        console.error(`センサーの登録に失敗しました: ${createRes.status}`);
        setErrorMessage("センサーの登録に失敗しました。デバイスIDが重複していないか確認してください。");
        return;
      }
      const created = (await createRes.json()) as Sensor;

      const ok = await linkSensorToSpace(spaceId, created.id);
      if (!ok) {
        setErrorMessage(
          "センサーは登録されましたが、スペースへの紐付けに失敗しました。センサー管理画面から紐付けし直してください。",
        );
        return;
      }
      closeForm();
      await refreshAll();
    } catch (error) {
      console.error("センサーの登録・紐付け中にエラーが発生しました", error);
      setErrorMessage("センサーの登録・紐付け中にエラーが発生しました。通信環境を確認して再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  // スペースとセンサーの紐付けを解除する
  const handleUnassign = async (spaceId: number) => {
    if (busy) return;
    setErrorMessage(null);
    setBusy(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v1/spaces/${spaceId}/sensor`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sensor_id: null }),
      });
      if (!res.ok) {
        console.error(`紐付けの解除に失敗しました: ${res.status}`);
        setErrorMessage("紐付けの解除に失敗しました。");
        return;
      }
      await refreshAll();
    } catch (error) {
      console.error("紐付け解除中にエラーが発生しました", error);
      setErrorMessage("紐付け解除中にエラーが発生しました。通信環境を確認して再度お試しください。");
    } finally {
      setBusy(false);
    }
  };

  const sortedSpaces = useMemo(
    () => [...spaces].sort((a, b) => a.parking_number - b.parking_number),
    [spaces],
  );

  return (
    <div className="flex w-full max-w-[390px] flex-col gap-5">
      <h1 className="px-4 text-base font-bold text-black">{parkingName} のセンサー管理</h1>

      {errorMessage && <p className="px-4 text-xs text-red-500">{errorMessage}</p>}

      <section className="flex flex-col gap-3 px-4">
        {sortedSpaces.length === 0 ? (
          <p className="text-xs text-gray-500">駐車スペースが登録されていません</p>
        ) : (
          sortedSpaces.map((space) => {
            const linkedSensor = space.sensor_id !== null ? sensorsById.get(space.sensor_id) : undefined;
            const isFormOpen = openSpaceId === space.id;

            return (
              <div key={space.id} className="flex flex-col gap-2 rounded-[5px] border border-[#d9d9d9] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-black">
                    {space.parking_number}番（{typeLabel[space.type] ?? space.type}）
                  </p>
                  <span
                    className="text-xs font-bold"
                    style={{ color: space.status === 0 ? "#3cae00" : "#e20000" }}
                  >
                    {space.status === 0 ? "空車" : "満車"}
                  </span>
                </div>

                {linkedSensor ? (
                  <>
                    <p className="text-xs text-black">紐付け中のセンサー: {linkedSensor.device_id}</p>
                    <button
                      type="button"
                      onClick={() => handleUnassign(space.id)}
                      disabled={busy}
                      className="h-[28px] w-fit cursor-pointer rounded-[5px] border border-[#e20000] bg-[#fbcdcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      紐付け解除
                    </button>
                  </>
                ) : isFormOpen ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3 text-xs text-black">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={assignMode === "existing"}
                          onChange={() => setAssignMode("existing")}
                          disabled={availableSensors.length === 0}
                        />
                        既存センサーから選ぶ
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          checked={assignMode === "new"}
                          onChange={() => setAssignMode("new")}
                        />
                        新規センサーを登録
                      </label>
                    </div>

                    {assignMode === "existing" ? (
                      availableSensors.length === 0 ? (
                        <p className="text-xs text-gray-500">未使用のセンサーがありません</p>
                      ) : (
                        <select
                          value={selectedSensorId}
                          onChange={(e) => setSelectedSensorId(e.target.value)}
                          className="rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black"
                        >
                          <option value="">選択してください</option>
                          {availableSensors.map((sensor) => (
                            <option key={sensor.id} value={sensor.id}>
                              {sensor.device_id}
                            </option>
                          ))}
                        </select>
                      )
                    ) : (
                      <input
                        type="text"
                        value={newDeviceId}
                        onChange={(e) => setNewDeviceId(e.target.value)}
                        placeholder="新しいデバイスID"
                        className="rounded-[5px] border border-[#a1a1a1] px-2 py-1 text-xs text-black placeholder:text-[#a1a1a1]"
                      />
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAssign(space.id)}
                        disabled={
                          busy ||
                          (assignMode === "existing" ? selectedSensorId === "" : newDeviceId.trim() === "")
                        }
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#3cff00] bg-[#d5fbcd] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        紐付ける
                      </button>
                      <button
                        type="button"
                        onClick={closeForm}
                        disabled={busy}
                        className="h-[28px] cursor-pointer rounded-[5px] border border-[#a1a1a1] bg-white px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => openForm(space.id)}
                    className="h-[28px] w-fit cursor-pointer rounded-[5px] border border-[#0095ff] bg-[#cde9fb] px-3 text-xs font-bold text-black transition-opacity hover:opacity-90"
                  >
                    センサーを紐付ける
                  </button>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
