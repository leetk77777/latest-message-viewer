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
  const initial = useMemo(() => getRoomId(), []);
  const [roomId, setRoom] = useState(initial);

  // ✅ 저장 성공 여부 표시용
  const [savedOk, setSavedOk] = useState(false);

  function save() {
    const v = roomId.trim();
    if (!v) {
      alert("roomId를 입력하세요.");
      return;
    }

    // 간단 검증(선택): 너무 짧으면 충돌 위험
    if (v.length < 6) {
      alert("roomId는 최소 6자 이상을 권장합니다.");
      return;
    }

    setRoomId(v);

    // ✅ 저장 확인 메시지 표시
    setSavedOk(true);

    // ❗ 이전처럼 바로 이동하고 싶으면 아래 한 줄을 다시 살리면 됩니다.
    // nav("/write");
  }

  function reset() {
    clearRoomId();
    setRoom("");
    setSavedOk(false);
  }

  function goWrite() {
    if (!getRoomId()) {
      alert("roomId를 먼저 저장하세요.");
      return;
    }
    nav("/write");
  }

  function goView() {
    if (!getRoomId()) {
      alert("roomId를 먼저 저장하세요.");
      return;
    }
    nav("/view");
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
        onChange={(e) => {
          setRoom(e.target.value);
          setSavedOk(false); // ✅ 수정하면 다시 "저장 필요" 상태로
        }}
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

      {/* ✅ 저장 확인 메시지 + 이동 버튼 */}
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
          roomId가 저장되었습니다 ✅
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button
              onClick={goWrite}
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
              onClick={goView}
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
          onClick={goView}
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
