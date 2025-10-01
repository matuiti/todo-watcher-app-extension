import { useEffect, useState } from "react";
import { getElapsedMs, formatRecord } from "../utils/date";
import type { Todo, TodoStatus } from "../utils/types";
import { checkConfirm } from "../utils/utils";
import { saveTodos, fetchTodos } from "../utils/storage";

// 状態ラベル
const statusLabels: Record<TodoStatus, string> = {
  ready: "準備中...",
  working: "作業カウント中...",
  paused: "一時停止中",
  done: "完了",
};

// 初期Todo
const initTodo: Todo = {
  id: 1,
  title: "",
  status: "ready",
  isStart: false,
  isPause: false,
  isDone: false,
  beforeTime: 0,
  accumulatedMs: 0,
  showRecord: false,
  record: "",
  date: ""
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
    showRecord: true,
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
    showRecord: true,
    record: formattedRecord,
  };
};

const resumeTodo = (todo: Todo): Todo => ({
  ...todo,
  isPause: false,
  isDone: false,
  status: "working",
  beforeTime: Date.now(),
  showRecord: false,
});

const TodoCounter = () => {
  const [todos, setTodos] = useState<Todo[]>([initTodo]);

  useEffect(() => {
    fetchTodos(setTodos);
  }, []);

  // 保存
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

  const handleAddTodo = async () => {
    const createTodo = (): Todo => ({
      id: Date.now(),
      title: "",
      status: "ready",
      isStart: false,
      isPause: false,
      isDone: false,
      beforeTime: 0,
      accumulatedMs: 0,
      showRecord: false,
      record: "",
      date: ""
    });
    const newTodo = createTodo();
    setTodos([...todos, newTodo]);
  };

  const handleDeleteTodo = (id: number) => {
    if (
      !window.confirm("このTODOを削除します。削除後にデータは復元できません。")
    )
      return;
    const newTodos = todos.filter((todo) => todo.id !== id);

    setTodos(newTodos);
  };
  const handleInputTitle = (id: number, value: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, title: value } : todo))
    );
  };
  return (
    <div className="text-[var(--text-color-todo)] flex flex-col gap-3">
      {/* <h1 className="text-[var(--text-color-title-app)]">Todo Watcher App Extension</h1> */}
      <div className="text-right">
        <button
          className="text-xs bg-[var(--bg-btn-add)] min-w-[var(--width-btn-add)] h-[var(--height-btn-add)] px-2 py-1 rounded transition-all duration-200 cursor-pointer hover:opacity-80"
          onClick={handleAddTodo}
        >
          新規追加
        </button>
      </div>
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex flex-col bg-[var(--bg-todo)] px-4 py-4"
        >
          <input
            maxLength={27}
            className="text-lg font-bold p-1 cursor-pointer hover:opacity-60 transition duration-200"
            type="text"
            placeholder="タイトルを編集"
            value={todo.title}
            onChange={(e) => handleInputTitle(todo.id, e.target.value)}
          />
          <hr className="border-[var(--border-color-hr)]" />
          <div className="mt-2.5 mb-2.5 ml-1">
            ステータス：
            <span className="">{statusLabels[todo.status]}</span>
            {todo.record && (
              <span
                className={`${
                  todo.showRecord
                    ? "opacity-100 transition-opacity duration-200 ease pl-1 text-right italic text-[var(--text-color-record)]"
                    : "opacity-0"
                }`}
              >
                {todo.record}
              </span>
            )}
          </div>
          <hr className="border-[var(--border-color-hr)]" />
          {/* buttons */}
          <div className="flex gap-[0.8em] mt-4 mb-1">
            {/* スタート/リセット */}
            <button
              className={`
                min-w-[var(--width-btn-counter)] px-2 py-1 rounded transition-all duration-200 cursor-pointer
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

            {/* 一時停止/再開 */}
            <button
              className={`
                min-w-[var(--width-btn-counter)] px-2 py-1 rounded transition-all duration-200
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

            {/* 完了/再開 */}
            <button
              className={`
                min-w-[var(--width-btn-counter)] px-2 py-1 rounded transition-all duration-200
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

            <div className="ml-auto border-l-1 border-[var(--border-color-hr)] pl-4">
              {/* 削除 */}
              <button
                className="text-xs bg-[var(--bg-btn-delete)] min-w-[var(--width-btn-delete)]  px-2 py-1 rounded cursor-pointer hover:opacity-80"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoCounter;
