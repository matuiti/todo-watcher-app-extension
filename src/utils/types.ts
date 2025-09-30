export type TodoStatus = "ready" | "working" | "paused" | "done";

export type Todo = {
  id: number;
  title: string;
  status: TodoStatus;
  isStart: boolean;
  isPause: boolean;
  isDone: boolean;
  beforeTime: number;
  accumulatedMs: number;
  record: string;
  date: string;
};

export type RecordTime = {
  hours: number;
  minutes: number;
  seconds: number;
};
