import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { getRoomId } from "./roomid";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

export default function Write() {
  const nav = useNavigate();
  const roomId = useMemo(() => getRoomId(), []);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">(
    "idle"
  );

  useEffect(() => {
    if (!roomId) nav("/room");
  }, [roomId, nav]);

  async function save() {
    const message = text.trim();
    if (!message) return;

    try {
      setStatus("saving");

      const { error } = await supabase
        .from("messages")
        .upsert(
          { room_id: roomId, content: message },
          { onConflict: "room_id" }
        );

      if (error) throw error;

      setText("");          // ✅ 저장 후 입력창 비우기
      setStatus("done");
    } catch (e) {
      console.error("SAVE ERROR:", e);
      setStatus("error");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>메시지 입력</h2>

      <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 14 }}>
        roomId: <b>{roomId}</b>
        <button
          onClick={() => nav("/room")}
          style={{ marginLeft: 10, padding: "6px 10px", fontSize: 13 }}
        >
          roomId 변경
        </button>
        <button
          onClick={() => nav("/view")}
          style={{ marginLeft: 8, padding: "6px 10px", fontSize: 13 }}
        >
          보기 화면
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            // PC: Ctrl+Enter / Cmd+Enter 저장
            e.preventDefault();
            save();
          }
        }}
        onPaste={() => {
          // 📱 모바일: 붙여넣기 하면 자동 저장
          setTimeout(() => save(), 0);
        }}
        rows={6}
        placeholder="메시지를 붙여넣으면 자동 저장됩니다"
        style={{
          width: "100%",
          fontSize: 16,
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          resize: "vertical",
        }}
      />

      <button
        onClick={save}
        disabled={status === "saving"}
        style={{
          marginTop: 12,
          padding: "12px 16px",
          fontSize: 16,
          borderRadius: 10,
          border: "1px solid #ccc",
          width: "100%",
          cursor: status === "saving" ? "not-allowed" : "pointer",
        }}
      >
        {status === "saving" ? "저장 중..." : "저장"}
      </button>

      <div style={{ marginTop: 12, minHeight: 22, fontSize: 14 }}>
        {status === "done" && <span>저장 완료 ✅</span>}
        {status === "error" && (
          <span style={{ color: "red" }}>
            저장 실패 ❌ (콘솔/네트워크 확인)
          </span>
        )}
      </div>

      <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
        ※ 이 roomId에는 항상 최신 메시지 1개만 저장됩니다.
      </div>
    </div>
  );
}
