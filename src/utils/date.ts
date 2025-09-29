import type { RecordTime } from "./types";

const formatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "full",
  timeStyle: "short",
});

export const getUpdateDate = (dateNow: number): string => {
  // 例: "2025/09/29 17:45"
  return formatter.format(dateNow);
};

export const setUpdateDate = (): string => {
  const dateNow = Date.now();
  return getUpdateDate(dateNow);
};

export function getRecordMs(startMs: number, endMs: number): RecordTime {
  const diffMs = endMs - startMs;
  const totalSec = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { hours, minutes, seconds };
}
