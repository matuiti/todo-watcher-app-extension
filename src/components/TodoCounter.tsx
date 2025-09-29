import { useState } from "react";
import { setUpdateDate } from "../utils/date";
import type { Todo, TodoStatus } from "../utils/types";

// 状態ラベル
const statusLabels: Record<TodoStatus, string> = {
  ready: "準備中・・・",
  working: "作業中",
  paused: "一時停止中",
  done: "完了",
};

// 初期Todo
const initTodo: Todo = {
  id: Date.now(),
  title: "New Task",
  status: "ready",
  isStart: false,
  isStop: false,
  isDone: false,
  record: "",
  date: setUpdateDate(),
};

const CounterItem = () => {
  const [todos, setTodos] = useState<Todo[]>([initTodo]);

  // --- stateを返すだけの関数群 ---
  const resetTodo = (todo: Todo): Todo => ({
    ...todo,
    status: "ready",
    isStart: false,
    isStop: false,
    isDone: false,
  });

  const startTodo = (todo: Todo): Todo => ({
    ...todo,
    status: "working",
    isStart: true,
  });

  const togglePauseTodo = (todo: Todo): Todo => ({
    ...todo,
    isStop: !todo.isStop,
    status: todo.isStop ? "working" : "paused",
  });

  const toggleDoneTodo = (todo: Todo): Todo => ({
    ...todo,
    isDone: !todo.isDone,
    status: todo.isDone ? "working" : "done",
  });

  // --- state更新をラップするだけの関数 ---
  const updateTodoById = (id: number, updateFn: (todo: Todo) => Todo) => {
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
      if (window.confirm("タイムをリセットしますか？この操作は戻せません。")) {
        updateTodoById(id, resetTodo);
      }
    } else {
      // 未開始 → スタート
      updateTodoById(id, startTodo);
    }
  };

  const handleStop = (id: number) => {
    updateTodoById(id, togglePauseTodo);
  };

  const handleDone = (id: number) => {
    updateTodoById(id, toggleDoneTodo);
  };

  // --- ボタンの無効化判定 ---
  const isStopButtonDisabled = (todo: Todo) =>
    todo.status === "ready" || todo.status === "done";

  const isDoneButtonDisabled = (todo: Todo) => todo.status === "ready";

  return (
    <div>
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex flex-col gap-2 bg-[var(--bg-todo)] text-[var(--text-color-todo)] px-6 py-4"
        >
          <h2>{todo.title}</h2>
          <div>
            今の状況：
            <span className="font-bold italic">
              {statusLabels[todo.status]}
            </span>
          </div>
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
                  isStopButtonDisabled(todo)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : todo.isStop
                    ? "bg-[var(--bg-btn-stop-go)] hover:opacity-80 cursor-pointer"
                    : "bg-[var(--bg-btn-stop)] hover:opacity-80 cursor-pointer"
                }
              `}
              onClick={() => handleStop(todo.id)}
              disabled={isStopButtonDisabled(todo)}
            >
              {todo.isStop ? "再開する" : "一時停止"}
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

export default CounterItem;
