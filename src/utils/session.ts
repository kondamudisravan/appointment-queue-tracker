// Unique identifier for this browser tab/session
export const getSessionId = (): string => {
  let id = sessionStorage.getItem('carepulse_session_id');
  if (!id) {
    id = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem('carepulse_session_id', id);
  }
  return id;
};

// Formats seconds into MM:SS
export const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Generates human-friendly booking IDs like BK-4829
export const generateBookingId = (): string => {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BK-${randomNum}`;
};
