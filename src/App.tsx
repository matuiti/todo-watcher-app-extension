import "./App.css";
import CounterItem from "./components/TodoCounter";

function App() {
  return (
    <div
      className={`px-1.5 bg-[var(--bg-app)] w-[var(--width-app)] min-h-[var(--height-app)] tracking-[var(--letter-spacing)]`}
    >
      <CounterItem />
    </div>
  );
}

export default App;
