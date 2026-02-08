import React, { useLayoutEffect, useRef, useState } from "react";

function useAutoScale() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const compute = () => {
      // Available space inside the frame
      const fw = frame.clientWidth;
      const fh = frame.clientHeight;

      // Natural size of your puzzle content (unscaled)
      const cw = content.scrollWidth;
      const ch = content.scrollHeight;

      if (!fw || !fh || !cw || !ch) {
        setScale(1);
        return;
      }

      // Scale down to fit — never scale up above 1
      const next = Math.min(fw / cw, fh / ch, 1);
      setScale(next);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(frame);
    ro.observe(content);

    window.addEventListener("orientationchange", compute);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return { frameRef, contentRef, scale };
}

export default function London() {
  const { frameRef, contentRef, scale } = useAutoScale();

  return (
    <div className="pageWrap">
      <h1 className="pageTitle">London Puzzle 🇬🇧</h1>

      <div className="puzzleFrameOuter">
        <div className="puzzleFrame puzzleFrame--scaled" ref={frameRef}>
          <div
            className="puzzleScaledStage"
            style={{
              transform: `scale(${scale})`,
            }}
          >
            <div className="puzzleScaledContent" ref={contentRef}>
              {/* ✅ PUT YOUR EXISTING LONDON PUZZLE COMPONENT HERE */}
              {/* Example: <LondonPuzzle /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}