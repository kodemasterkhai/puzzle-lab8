import "../index.css";
import DailyChessPuzzle from "./DailyChessPuzzle";
import LondonJigsaw from "./LondonJigsaw";

export default function London() {
  return (
    <div className="container">
      <div className="heroCard">
        <h1 className="heroTitle">London Puzzle Lab</h1>
        <p className="heroSub">Two challenges on one page. Built in public — improving over time.</p>
      </div>

      <div className="grid2">
        <DailyChessPuzzle />
        <LondonJigsaw />
      </div>
    </div>
  );
}