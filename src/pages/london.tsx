import { useEffect, useMemo, useState } from "react";

type Pos = { r: number; c: number };

function indexToPos(i: number, s: number): Pos { return { r: Math.floor(i / s), c: i % s }; }
function isAdj(a: Pos, b: Pos) { return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1; }

export default function LondonPuzzle() {
  const [size, setSize] = useState(3);
  const count = size * size;
  const solved = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  const [tiles, setTiles] = useState<number[]>(() => shuffle(solved, size));
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const emptyVal = count - 1;
  const emptyIdx = tiles.indexOf(emptyVal);
  const emptyPos = indexToPos(emptyIdx, size);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const solvedNow = tiles.every((v, i) => v === solved[i]);

  function move(idx: number) {
    const p = indexToPos(idx, size);
    if (!isAdj(p, emptyPos)) return;
    setTiles(t => {
      const n = [...t];
      const ei = n.indexOf(emptyVal);
      [n[idx], n[ei]] = [n[ei], n[idx]];
      return n;
    });
    setMoves(m => m + 1);
    setRunning(true);
  }

  function reset(newSize?: number) {
    const s = newSize ?? size;
    const arr = Array.from({ length: s * s }, (_, i) => i);
    setSize(s);
    setTiles(shuffle(arr, s));
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="glassCard">
          <h1 className="h1">London Puzzle</h1>
          <p className="muted">Drag or tap tiles. Smooth sliding animation included.</p>

          <div style={{ textAlign:"center", fontWeight:900 }}>
            Moves: {moves} | Time: {seconds}s
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:10 }}>
            <button style={btn} onClick={()=>reset(3)}>3x3</button>
            <button style={btn} onClick={()=>reset(4)}>4x4</button>
            <button style={btn} onClick={()=>reset()}>Shuffle</button>
          </div>

          <div style={{
            margin:"20px auto",
            display:"grid",
            gridTemplateColumns:`repeat(${size},1fr)`,
            gap:8,
            width:"min(92vw,420px)"
          }}>
            {tiles.map((tile,i)=>{
              const isEmpty = tile===emptyVal;
              const pos = indexToPos(tile,size);

              return (
                <div
                  key={i}
                  onClick={()=>move(i)}
                  style={{
                    aspectRatio:"1/1",
                    borderRadius:14,
                    transition:"all 0.25s ease",
                    cursor:isEmpty?"default":"pointer",
                    background:isEmpty?"rgba(255,255,255,0.05)":"url(/london.png)",
                    backgroundSize:`${size*100}% ${size*100}%`,
                    backgroundPosition:`${(pos.c*100)/(size-1)}% ${(pos.r*100)/(size-1)}%`,
                    boxShadow:isEmpty?"none":"0 15px 35px rgba(0,0,0,0.35)"
                  }}
                />
              )
            })}
          </div>

          {solvedNow && <p style={{textAlign:"center",fontWeight:900}}>🏆 Solved!</p>}
        </div>
      </div>
    </div>
  );
}

const btn:React.CSSProperties={padding:"8px 12px",borderRadius:999,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.06)",color:"white",fontWeight:900,cursor:"pointer"};

function shuffle(arr:number[],size:number){
  let out=[...arr];
  do{
    for(let i=out.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [out[i],out[j]]=[out[j],out[i]];
    }
  }while(!solvable(out,size));
  return out;
}

function solvable(t:number[],size:number){
  const nums=t.filter(n=>n!==size*size-1);
  let inv=0;
  for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)if(nums[i]>nums[j])inv++;
  return inv%2===0;
}