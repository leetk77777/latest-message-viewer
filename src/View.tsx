import { useCallback, useEffect, useState } from "react";
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

async function copyToClipboard(text: string) {
  // ✅ 최신 브라우저
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // ✅ 구형/예외 대비 fallback
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}

export default function View() {
  const nav = useNavigate();
  const roomId = getRoomId();

  const [msg, setMsg] = useState<Message | null>(null);
  const [status, setStatus] = useState<"ok" | "loading" | "error">("loading");

  // ✅ 복사 알림용
  const [copied, setCopied] = useState<"idle" | "done" | "error">("idle");

  const fetchLatest = useCallback(async () => {
    try {
      setStatus("loading");

      const { data, error } = await supabase
        .from("messages")
        .select("room_id,text,created_at")
        .eq("room_id", roomId)
        .maybeSingle();

      if (error) throw error;

      setMsg(data ?? null);
      setStatus("ok");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  }, [roomId]);

  const onCopy = useCallback(async () => {
    const text = msg?.text ?? "";
    if (!text.trim()) return;

    try {
      await copyToClipboard(text);
      setCopied("done");
      window.setTimeout(() => setCopied("idle"), 1200);
    } catch (e) {
      console.error(e);
      setCopied("error");
      window.setTimeout(() => setCopied("idle"), 1600);
    }
  }, [msg]);

  useEffect(() => {
    if (!roomId) {
      nav("/room");
      return;
    }

    fetchLatest(); // 1회 로드
  }, [roomId, fetchLatest, nav]);

  const hasText = !!msg?.text?.trim();

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
        <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 10 }}>
          최신 메시지 / roomId: <b>{roomId}</b>{" "}
          <button onClick={() => nav("/room")} style={{ marginLeft: 8 }}>
            roomId 변경
          </button>
          <button onClick={() => nav("/write")} style={{ marginLeft: 8 }}>
            입력하기
          </button>

          {/* 🔄 새로고침 버튼 */}
          <button
            onClick={fetchLatest}
            disabled={status === "loading"}
            style={{
              marginLeft: 8,
              padding: "6px 10px",
              fontSize: 13,
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              opacity: status === "loading" ? 0.6 : 1,
            }}
            title="즉시 새로고침"
          >
            {status === "loading" ? "새로고침 중..." : "새로고침"}
          </button>

          {/* ✅ 복사 버튼 */}
          <button
            onClick={onCopy}
            disabled={!hasText}
            style={{
              marginLeft: 8,
              padding: "6px 10px",
              fontSize: 13,
              borderRadius: 10,
              border: "1px solid #ccc",
              cursor: hasText ? "pointer" : "not-allowed",
              opacity: hasText ? 1 : 0.5,
            }}
            title={hasText ? "현재 메시지를 복사합니다" : "복사할 메시지가 없습니다"}
          >
            {copied === "done" ? "복사됨 ✅" : copied === "error" ? "복사 실패 ❌" : "복사"}
          </button>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 24,
            fontSize: 28,
            lineHeight: 1.4,
            whiteSpace: "pre-wrap", // ✅ 줄바꿈 그대로
            wordBreak: "break-word",
            minHeight: 120,
          }}
        >
          {status === "loading" && "불러오는 중..."}
          {status === "error" && "오류가 발생했습니다. 콘솔을 확인하세요."}
          {status === "ok" &&
            (msg ? msg.text : "아직 메시지가 없습니다. /write에서 입력하세요.")}
        </div>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.7 }}>
          {msg ? `업데이트: ${formatKST(msg.created_at)}` : ""}
        </div>
      </div>
    </div>
  );
}