import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomId, setRoomId, clearRoomId } from "./roomid";

function makeRandomRoomId() {
  // 사람이 읽기 쉬운 랜덤(영문/숫자) 12자리
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "room-";
  for (let i = 0; i < 12; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function Room() {
  const nav = useNavigate();
  const saved = useMemo(() => getRoomId(), []);
  const [roomId, setRoom] = useState(saved);

  function save() {
    const v = roomId.trim();
    if (!v) return;

    // 간단 검증(선택): 너무 짧으면 충돌 위험
    if (v.length < 6) {
      alert("roomId는 최소 6자 이상을 권장합니다.");
      return;
    }

    setRoomId(v);
    nav("/write");
  }

  function reset() {
    clearRoomId();
    setRoom("");
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Room ID 설정</h2>
      <p style={{ opacity: 0.75, marginTop: 0 }}>
        본인이 사용할 roomId를 입력하세요. 한 번 저장하면 브라우저에 계속 유지됩니다.
      </p>

      <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
        roomId
      </label>
      <input
        value={roomId}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="예: room-abc123xyz789"
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
          저장하고 입력으로
        </button>

        <button
          onClick={() => setRoom(makeRandomRoomId())}
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

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={() => nav("/view")}
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
        ※ 여러 사람이 쓸 경우 roomId가 겹치면 같은 방을 공유하게 됩니다. <br />
        충돌 방지를 위해 “랜덤 생성”을 권장합니다.
      </div>
    </div>
  );
}
