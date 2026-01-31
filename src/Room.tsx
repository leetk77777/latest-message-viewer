import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomId, setRoomId, clearRoomId } from "./roomid";

function makeRandomRoomId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "room-";
  for (let i = 0; i < 28; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function Room() {
  const nav = useNavigate();
  const initial = useMemo(() => getRoomId(), []);
  const [roomId, setRoom] = useState(initial);
  const [savedOk, setSavedOk] = useState(false);

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("roomId 복사 완료 ✅ (PC에도 동일하게 입력하세요)");
    } catch {
      alert("복사 실패: 수동으로 선택해서 복사해 주세요.");
    }
  }

  function save() {
    const v = roomId.trim();
    if (!v) {
      alert("roomId를 입력하세요.");
      return;
    }
    if (v.length < 16) {
      alert("roomId는 최소 16자 이상 권장합니다. (추측/충돌 방지)");
      return;
    }

    setRoomId(v);
    setSavedOk(true);
  }

  function reset() {
    clearRoomId();
    setRoom("");
    setSavedOk(false);
  }

  function view() {
    const v = roomId.trim();
    if (!v) {
      alert("roomId를 입력하세요.");
      return;
    }

    nav("/view");
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Room ID 설정</h2>
      <p style={{ opacity: 0.75, marginTop: 0, lineHeight: 1.5 }}>
        📌 목적: <b>휴대폰에서 저장</b> → <b>PC에서 보기</b><br />
        따라서 <b>휴대폰/PC가 동일한 roomId</b>를 사용해야 합니다.
      </p>

      <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>roomId</label>
      <input
        value={roomId}
        onChange={(e) => {
          setRoom(e.target.value);
          setSavedOk(false);
        }}
        placeholder="랜덤 생성 후 저장을 권장합니다"
        style={{
          width: "100%",
          fontSize: 16,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
        }}
      />

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={save}
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 16,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          저장
        </button>

        <button
          onClick={() => {
            setRoom(makeRandomRoomId());
            setSavedOk(false);
          }}
          style={{
            padding: "12px 14px",
            fontSize: 14,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          랜덤 생성
        </button>
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.75 }}>
        현재 저장된 roomId: <b>{getRoomId() || "(없음)"}</b>
      </div>

      {savedOk && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #c8e6c9",
            background: "#e8f5e9",
            color: "#2e7d32",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          roomId 저장 완료 ✅<br />
          이제 <b>이 roomId를 PC에도 똑같이 저장</b>하면, 폰/PC가 동기화됩니다.
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              onClick={() => copyToClipboard(roomId.trim())}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              roomId 복사
            </button>
            <button
              onClick={() => nav("/write")}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              입력 화면으로
            </button>
            <button
              onClick={view}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ccc",
                cursor: "pointer",
              }}
            >
              보기 화면으로
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={view}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          보기 화면으로
        </button>

        <button
          onClick={reset}
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          roomId 초기화
        </button>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7, lineHeight: 1.5 }}>
        ✅ 충돌/추측 방지: 랜덤 roomId를 길게(최소 24자 이상) 쓰면 사실상 안전합니다. <br />
        ✅ 같은 roomId를 폰/PC에 저장하면 “내 메시지만” 업데이트됩니다.
      </div>
    </div>
  );
}
