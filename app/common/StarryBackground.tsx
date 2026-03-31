import { zodiacSymbols } from "../data/mockData";


export default function StarryBackground() {
  return (
    <>
      <div className="starry-bg" />
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {zodiacSymbols.map((s, i) => (
          <span
            key={i}
            className="absolute text-primary/6 select-none"
            style={{
              fontSize: `${20 + Math.random() * 30}px`,
              left: `${(i * 8.3) % 100}%`,
              top: `${(i * 17 + 5) % 95}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {s}
          </span>
        ))}
      </div>
    </>
  );
}
