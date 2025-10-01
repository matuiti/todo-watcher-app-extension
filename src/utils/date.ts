import type { RecordTime } from "./types";

// const formatter = new Intl.DateTimeFormat("ja-JP", {
//   dateStyle: "full",
//   timeStyle: "short",
// });

// 例: "2025/09/29 17:45"
// export const getUpdateDate = (dateNow: number): string => {
//   return formatter.format(dateNow);
// };

export function getConvertTime(elapsedTime: number): RecordTime {
  const totalSec = Math.floor(elapsedTime / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { hours, minutes, seconds };
}

export const formatRecord = (ms: number) => {
  const t = getConvertTime(ms);
  return `  ${t.hours}時間${t.minutes}分${t.seconds}秒`;
};

export const getElapsedMs = (start: number, end: number): number => {
  if (start >= end) return 0;
  return end - start;
};