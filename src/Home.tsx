import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRoomId } from "./roomid";

function isMobileUA() {
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

export default function Home() {
  const nav = useNavigate();

  useEffect(() => {
    // roomId 없으면 먼저 설정으로
    if (!getRoomId()) {
      nav("/room", { replace: true });
      return;
    }

    // 기기 따라 자동 분기
    if (isMobileUA()) nav("/write", { replace: true });
    else nav("/view", { replace: true });
  }, [nav]);

  // 아주 잠깐 보일 수 있어서 최소 UI만
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 16 }}>이동 중...</div>
      <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={() => nav("/view")}>PC용 보기</button>
        <button onClick={() => nav("/write")}>휴대폰 입력</button>
        <button onClick={() => nav("/room")}>roomId 설정</button>
      </div>
    </div>
  );
}
