import React, { useEffect, useMemo, useRef, useState } from "react";
export default function EMDRDirectionApp() {
  const { useEffect, useMemo, useRef, useState } = React;

  const directions = useMemo(
    () => [
      "上",
      "下",
      "左",
      "右",
      "左上",
      "左下",
      "右上",
      "右下",
      "顺时针",
      "逆时针",
    ],
    []
  );

  const [running, setRunning] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1500);
  const [current, setCurrent] = useState("准备开始");
  const timerRef = useRef(null);
  const synthRef = useRef(
    typeof window !== "undefined" ? window.speechSynthesis : null
  );

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  const nextInstruction = () => {
    const idx = Math.floor(Math.random() * directions.length);
    const cmd = directions[idx];
    setCurrent(cmd);
    speak(cmd);
  };

  useEffect(() => {
    if (running) {
      nextInstruction();
      timerRef.current = setInterval(nextInstruction, intervalMs);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, intervalMs]);

  const stop = () => {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    synthRef.current?.cancel();
    setCurrent("已停止");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center">
          EMDR 随机眼动语音训练
        </h1>
        <p className="text-center text-gray-600">
          随机播报：上下左右、四个斜角、顺时针、逆时针
        </p>

        <div className="rounded-3xl border p-10 text-center">
          <div className="text-sm text-gray-500 mb-2">当前指令</div>
          <div className="text-6xl font-semibold tracking-wide">{current}</div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">播报间隔（毫秒）</label>
          <input
            type="range"
            min="800"
            max="4000"
            step="100"
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-gray-600">{intervalMs} ms</div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setRunning(true)}
            disabled={running}
            className="px-6 py-3 rounded-2xl bg-black text-white disabled:opacity-50"
          >
            开始
          </button>
          <button
            onClick={stop}
            className="px-6 py-3 rounded-2xl border border-gray-300"
          >
            停止
          </button>
          <button
            onClick={nextInstruction}
            className="px-6 py-3 rounded-2xl border border-gray-300"
          >
            下一条
          </button>
        </div>

        <div className="text-sm text-gray-500 leading-6">
          建议在安静、安全的环境中使用。如果你正在和专业治疗师一起做
          EMDR，可以把节奏调慢到 1500–2500ms，方便眼球追随和情绪稳定。
        </div>
      </div>
    </div>
  );
}
