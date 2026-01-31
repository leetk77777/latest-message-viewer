const KEY = "latest_viewer_room_id";

export function getRoomId(): string {
  return localStorage.getItem(KEY) || "";
}

export function setRoomId(roomId: string) {
  localStorage.setItem(KEY, roomId);
}

export function clearRoomId() {
  localStorage.removeItem(KEY);
}
