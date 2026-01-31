import { useEffect, useState } from "react";
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
  const roomId = getRoomId();

  const [msg, setMsg] = useState<Message | null>(null);
  const [status, setStatus] = useState<"ok" | "loading" | "error">("loading");

  async function fetchLatest() {
    try {
      setStatus("loading");

      const { data, error } = await supabase
        .from("messages")
        .select("room_id,text,created_at")
        .eq("room_id", roomId)
        .single();

      // single()은 row가 없으면 error가 날 수 있어요.
      if (error) {
        // 아직 저장된 메시지가 없는 경우도 있으니, 그때는 msg를 null로 처리
        setMsg(null);
        setStatus("ok");
        return;
      }

      setMsg(data);
      setStatus("ok");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  useEffect(() => {
    if (!roomId) {
      nav("/room");
      return;
    }
    fetchLatest();
    const t = window.setInterval(fetchLatest, 20000); // ✅ 20초
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

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
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            fontSize: 28,
            lineHeight: 1.4,
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
