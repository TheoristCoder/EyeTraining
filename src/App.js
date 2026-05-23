import React, { useEffect, useRef, useState } from "react";

export default function StandardEMDRApp() {
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [dotSize, setDotSize] = useState(72);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);

  const positionRef = useRef(0);
  const directionRef = useRef(1);
  const lastSideRef = useRef("left");

  const [dotX, setDotX] = useState(0);

  const playClick = (side) => {
    if (!soundEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          window.webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const panner = ctx.createStereoPanner();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;

      panner.pan.value = side === "left" ? -1 : 1;

      gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      oscillator.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!running) {
      cancelAnimationFrame(animationRef.current);
      return;
    }

    const animate = () => {
      const container = containerRef.current;
      if (!container) return;

      const width = container.offsetWidth;
      const padding = dotSize;
      const minX = padding;
      const maxX = width - padding;

      positionRef.current += directionRef.current * speed;

      if (positionRef.current >= maxX) {
        positionRef.current = maxX;
        directionRef.current = -1;

        if (lastSideRef.current !== "right") {
          playClick("right");
          lastSideRef.current = "right";
        }
      }

      if (positionRef.current <= minX) {
        positionRef.current = minX;
        directionRef.current = 1;

        if (lastSideRef.current !== "left") {
          playClick("left");
          lastSideRef.current = "left";
        }
      }

      setDotX(positionRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [running, speed, dotSize, soundEnabled]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    positionRef.current = width / 2;
    setDotX(width / 2);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;

    if (!document.fullscreenElement) {
      await el?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      await document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-black"
    >
      <div className="absolute top-0 left-0 right-0 z-20 p-6 flex flex-wrap gap-4 items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div>
          <h1 className="text-white text-3xl font-bold">标准 EMDR 横向追踪</h1>
          <p className="text-gray-300 text-sm mt-1">
            让眼睛持续跟随移动光点，不要转动头部
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setRunning((v) => !v)}
            className="px-5 py-3 rounded-2xl bg-white text-black font-medium"
          >
            {running ? "暂停" : "开始"}
          </button>

          <button
            onClick={toggleFullscreen}
            className="px-5 py-3 rounded-2xl border border-white/30 text-white"
          >
            {fullscreen ? "退出全屏" : "全屏模式"}
          </button>

          <button
            onClick={() => setSoundEnabled((v) => !v)}
            className="px-5 py-3 rounded-2xl border border-white/30 text-white"
          >
            {soundEnabled ? "声音开启" : "声音关闭"}
          </button>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-full h-[2px] bg-white/10" />

        <div
          className="absolute rounded-full bg-cyan-400 shadow-[0_0_60px_rgba(34,211,238,0.9)]"
          style={{
            width: `${dotSize}px`,
            height: `${dotSize}px`,
            left: `${dotX - dotSize / 2}px`,
            transition: "none",
          }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-3xl mx-auto space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>移动速度</span>
              <span>{speed}</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>光点大小</span>
              <span>{dotSize}px</span>
            </div>
            <input
              type="range"
              min="32"
              max="120"
              step="4"
              value={dotSize}
              onChange={(e) => setDotSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="text-sm text-gray-400 leading-6">
            标准 EMDR 通常使用左右规律移动的视觉刺激，配合双侧声音或触觉刺激。
            建议在大屏幕、平视距离和低干扰环境中使用。若出现明显不适、眩晕或情绪失控，应立即停止。
          </div>
        </div>
      </div>
    </div>
  );
}
