import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { getRoomId } from "./roomid";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type Message = {
  room_id: string;
  text: string;
  created_at: string;
};

function formatKST(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default function View() {
  const nav = useNavigate();
  const roomId = useMemo(() => getRoomId(), []);

  const [msg, setMsg] = useState<Message | null>(null);
  const [status, setStatus] = useState<"ok" | "loading" | "error">("loading");

  const fetchLatest = useCallback(async () => {
    try {
      // ok일 때는 loading으로 바꿔 깜빡이게 하지 않음
      setStatus((prev) => (prev === "ok" ? "ok" : "loading"));

      const { data, error } = await supabase
        .from("messages")
        .select("room_id,text,created_at")
        .eq("room_id", roomId)
        .maybeSingle();

      if (error) {
        console.error("FETCH ERROR:", error);
        setStatus("error");
        return;
      }

      setMsg(data ?? null);
      setStatus("ok");
    } catch (e) {
      console.error("FETCH EXCEPTION:", e);
      setStatus("error");
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) {
      nav("/room");
      return;
    }

    // ✅ effect 본문에서 동기 setState 경고 방지
    const first = window.setTimeout(() => {
      fetchLatest();
    }, 0);

    const t = window.setInterval(fetchLatest, 20000);

    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [roomId, nav, fetchLatest]);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 900, width: "100%" }}>
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 8 }}>
          최신 메시지 (20초 갱신) / roomId: <b>{roomId}</b>{" "}
          <button onClick={() => nav("/room")} style={{ marginLeft: 8 }}>
            roomId 변경
          </button>
          <button onClick={() => nav("/write")} style={{ marginLeft: 8 }}>
            입력하기
          </button>
          <button onClick={fetchLatest} style={{ marginLeft: 8 }}>
            새로고침
          </button>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            fontSize: 28,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap",  // ✅ 줄바꿈/공백 그대로
            wordBreak: "break-word",
            minHeight: 120,
          }}
        >
          {status === "loading" && "불러오는 중..."}
          {status === "error" && "오류가 발생했습니다. 콘솔을 확인하세요."}
          {status === "ok" && (msg ? msg.text : "아직 메시지가 없습니다. /write에서 입력하세요.")}
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
          {msg ? `업데이트: ${formatKST(msg.created_at)}` : ""}
        </div>
      </div>
    </div>
  );
}
