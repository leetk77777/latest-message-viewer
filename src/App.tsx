import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase env가 비어있습니다. .env를 확인하세요.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Message = {
  id: number;
  text: string;
  created_at: string;
};

function formatKST(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export default function App() {
  const [msg, setMsg] = useState<Message | null>(null);
  const [status, setStatus] = useState<"ok" | "loading" | "error">("loading");

  async function fetchLatest() {
    try {
      setStatus("loading");
      const { data, error } = await supabase
        .from("messages")
        .select("id,text,created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      setMsg(data?.[0] ?? null);
      setStatus("ok");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }

  useEffect(() => {
    fetchLatest();
    const t = window.setInterval(fetchLatest, 20000); // 20초마다 갱신
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 900, width: "100%" }}>
        <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 8 }}>
          최신 메시지 뷰어 (20초 자동 갱신)
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            fontSize: 28,
            lineHeight: 1.4,
            wordBreak: "break-word",
            minHeight: 320,
          }}
        >
          {status === "loading" && "불러오는 중..."}
          {status === "error" && "오류가 발생했습니다. 콘솔을 확인하세요."}
          {status === "ok" && (msg ? msg.text : "메시지가 없습니다.")}
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
          {msg ? `업데이트: ${formatKST(msg.created_at)} (id: ${msg.id})` : ""}
        </div>
      </div>
    </div>
  );
}
