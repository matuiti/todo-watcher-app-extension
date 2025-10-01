import "./App.css";
import TodoCounter from "./components/TodoCounter";

function App() {
  return (
    <div
      className={`pl-2.5 bg-[var(--bg-app)] w-[var(--width-app)] min-h-[var(--height-app)] tracking-[var(--letter-spacing)]`}
    >
      <TodoCounter />
    </div>
  );
}

export default App;
