import type { Dispatch, SetStateAction } from "react";
import type { Todo } from "./types";

export const saveTodos = async (Todos: Todo[]): Promise<void> => {
  await chrome.storage.local.set({ Todos });
};

export const loadTodos = async (): Promise<Todo[]> => {
  const result = await chrome.storage.local.get("Todos");
  return result.Todos ?? [];
};

export const fetchTodos = async (setFn: Dispatch<SetStateAction<Todo[]>>) => {
  const loadedTodos = await loadTodos();
  // 空配列なら上書きしない（初期値を維持）
  if (Array.isArray(loadedTodos) && loadedTodos.length > 0) {
    setFn(loadedTodos);
  }
};
