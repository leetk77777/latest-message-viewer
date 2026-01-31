import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { getRoomId, setRoomId, clearRoomId } from "./roomid";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

function makeRandomRoomId() {
  // 충돌 방지 위해 길게(24자리) 추천
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "room-";
  for (let i = 0; i < 24; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export default function Room() {
  const nav = useNavigate();
  const initial = useMemo(() => getRoomId(), []);
  const [roomId, setRoom] = useState(initial);

  const [savedOk, setSavedOk] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  async function isRoomIdTaken(id: string) {
    const { data, error } = await supabase
      .from("messages")
      .select("room_id")
      .eq("room_id", id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  }

  async function save() {
    const v = roomId.trim();
    if (!v) {
      alert("roomId를 입력하세요.");
      return;
    }

    // 너무 짧으면 충돌/추측 위험
    if (v.length < 12) {
      alert("roomId는 최소 12자 이상 권장합니다. (충돌 방지)");
      return;
    }

    try {
      setStatus("checking");
      setErrorMsg("");
      setSavedOk(false);

      const currentSaved = getRoomId();

      // 같은 브라우저에서 기존 roomId 재저장은 허용
      if (currentSaved && currentSaved === v) {
        setRoomId(v);
        setSavedOk(true);
        setStatus("idle");
        return;
      }

      // DB에 존재하면 막기(남의 방일 가능성)
      const taken = await isRoomIdTaken(v);
      if (taken) {
        setStatus("idle");
        setErrorMsg(
          "이미 DB에 존재하는 roomId 입니다. 다른 사람이 사용 중일 수 있어요. '랜덤 생성'을 권장합니다."
        );
        return;
      }

      // DB에 없으면 저장 OK
      setRoomId(v);
      setSavedOk(true);
      setStatus("idle");
    } catch (e) {
      console.error("ROOM CHECK ERROR:", e);
      setStatus("error");
      setErrorMsg("roomId 중복 체크 중 오류가 발생했습니다. 콘솔/네트워크를 확인하세요.");
    }
  }

  function reset() {
    clearRoomId();
    setRoom("");
    setSavedOk(false);
    setStatus("idle");
    setErrorMsg("");
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
        roomId 저장 시 DB에 이미 존재하는 roomId면(충돌 방지) 저장을 막습니다.
      </p>

      <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>roomId</label>

      <input
        value={roomId}
        onChange={(e) => {
          setRoom(e.target.value);
          setSavedOk(false);
          setErrorMsg("");
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
        }}
        placeholder="예: room-xxxxxxxxxxxxxxxxxxxxxxxx"
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
          disabled={status === "checking"}
          style={{
            flex: 1,
            padding: "12px 14px",
            fontSize: 16,
            borderRadius: 10,
            border: "1px solid #ccc",
            cursor: status === "checking" ? "not-allowed" : "pointer",
          }}
        >
          {status === "checking" ? "확인 중..." : "저장"}
        </button>

        <button
          onClick={() => {
            setRoom(makeRandomRoomId());
            setSavedOk(false);
            setErrorMsg("");
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

      {errorMsg && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ffcdd2",
            background: "#ffebee",
            color: "#c62828",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {errorMsg}
        </div>
      )}

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
        ※ roomId가 겹치면 같은 방을 공유하게 됩니다. <br />
        충돌 방지를 위해 “랜덤 생성”을 권장합니다.
      </div>
    </div>
  );
}
