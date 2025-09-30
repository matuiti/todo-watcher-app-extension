import { useEffect, useState } from "react";
import { getUpdateDate, getElapsedMs, formatRecord } from "../utils/date";
import type { Todo, TodoStatus } from "../utils/types";
import { checkConfirm } from "../utils/utils";
import { saveTodos, fetchTodos } from "../utils/storage";

// 状態ラベル
const statusLabels: Record<TodoStatus, string> = {
  ready: "準備中・・・",
  working: "作業カウント中・・・",
  paused: "一時停止中",
  done: "完了",
};

// 初期Todo
const initTodo: Todo = {
  id: Date.now(),
  title: "New Task",
  status: "ready",
  isStart: false,
  isPause: false,
  isDone: false,
  beforeTime: 0,
  accumulatedMs: 0,
  record: "",
  date: getUpdateDate(Date.now()),
};

// --- クリックしたボタンに応じてtodoの内容を更新する関数群 ---
const resetTodo = (todo: Todo): Todo => ({
  ...todo,
  status: "ready",
  isStart: false,
  isPause: false,
  isDone: false,
  beforeTime: 0,
  accumulatedMs: 0,
  record: "",
});

const startTodo = (todo: Todo): Todo => ({
  ...todo,
  status: "working",
  isStart: true,
  beforeTime: Date.now(),
});

const pauseTodo = (todo: Todo): Todo => {
  const endTime = Date.now();
  const extra = getElapsedMs(todo.beforeTime, endTime);
  const total = todo.accumulatedMs + extra;
  const formattedRecord = formatRecord(total);

  return {
    ...todo,
    isPause: true,
    status: "paused",
    accumulatedMs: total,
    record: formattedRecord,
  };
};

const doneTodo = (todo: Todo): Todo => {
  const endTime = Date.now();
  const extra =
    todo.status === "working" ? getElapsedMs(todo.beforeTime, endTime) : 0;
  const total = todo.accumulatedMs + extra;
  const formattedRecord = formatRecord(total);

  return {
    ...todo,
    isDone: true,
    status: "done",
    accumulatedMs: total,
    record: formattedRecord,
  };
};

const resumeTodo = (todo: Todo): Todo => ({
  ...todo,
  isPause: false,
  isDone: false,
  status: "working",
  beforeTime: Date.now(),
});

const TodoCounter = () => {
  const [todos, setTodos] = useState<Todo[]>([initTodo]);

  useEffect(() => {
    fetchTodos(setTodos);
  }, []);

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  // --- 任意のtodoのステータスを一括更新する関数 ---
  const updateTodoStates = (id: number, updateFn: (todo: Todo) => Todo) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? updateFn(todo) : todo))
    );
  };

  // --- UIイベント処理（副作用はここにまとめる） ---
  const handleStart = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (todo.isStart) {
      // すでに開始済み → リセット確認
      if (
        checkConfirm("タイムをリセットしますか？注意：この操作は戻せません。")
      ) {
        updateTodoStates(id, resetTodo);
      }
    } else {
      // 未開始 → スタート
      updateTodoStates(id, startTodo);
    }
  };

  const handlePause = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (todo.isPause) {
      // 一時停止中 → 再開
      updateTodoStates(id, resumeTodo);
    } else {
      // 作業中 → 一時停止
      updateTodoStates(id, pauseTodo);
    }
  };

  const handleDone = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (todo.isDone) {
      // 完了済み → 再開
      updateTodoStates(id, resumeTodo);
    } else {
      // 作業中 → 完了
      updateTodoStates(id, doneTodo);
    }
  };

  // --- ボタンの無効化判定 ---
  const isPauseButtonDisabled = (todo: Todo) =>
    todo.status === "ready" || todo.status === "done";
  const isDoneButtonDisabled = (todo: Todo) =>
    todo.status === "ready" || todo.status === "paused";

  return (
    <div>
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex flex-col gap-2 bg-[var(--bg-todo)] text-[var(--text-color-todo)] px-6 py-4"
        >
          <h2>{todo.title}</h2>
          <div>
            ステータス：
            <span className="font-bold italic">
              {statusLabels[todo.status]}
            </span>
          </div>
          {todo.record && (
            <div>
              スコア（経過時間の合計）：
              <span className="font-semibold">{todo.record}</span>
            </div>
          )}
          <div className="flex gap-4">
            {/* スタート／リセット */}
            <button
              className={`
                px-2 py-1 rounded transition-all duration-200 cursor-pointer
                ${
                  todo.isStart
                    ? "bg-[var(--bg-btn-reset)] hover:opacity-80"
                    : "bg-[var(--bg-btn-start)] hover:opacity-80"
                }
              `}
              onClick={() => handleStart(todo.id)}
            >
              {todo.isStart ? "リセット" : "スタート"}
            </button>

            {/* 一時停止 */}
            <button
              className={`
                px-2 py-1 rounded transition-all duration-200
                ${
                  isPauseButtonDisabled(todo)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : todo.isPause
                    ? "bg-[var(--bg-btn-pause-go)] hover:opacity-80 cursor-pointer"
                    : "bg-[var(--bg-btn-pause)] hover:opacity-80 cursor-pointer"
                }
              `}
              onClick={() => handlePause(todo.id)}
              disabled={isPauseButtonDisabled(todo)}
            >
              {todo.isPause ? "再開する" : "一時停止"}
            </button>

            {/* 完了 */}
            <button
              className={`
                px-2 py-1 rounded transition-all duration-200
                ${
                  isDoneButtonDisabled(todo)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : todo.isDone
                    ? "bg-[var(--bg-btn-done-go)] hover:opacity-80 cursor-pointer"
                    : "bg-[var(--bg-btn-done)] hover:opacity-80 cursor-pointer"
                }
              `}
              onClick={() => handleDone(todo.id)}
              disabled={isDoneButtonDisabled(todo)}
            >
              {todo.isDone ? "再開する" : "完了"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoCounter;
