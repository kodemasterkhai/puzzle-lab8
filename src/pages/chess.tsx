import React from "react";

export default function Chess() {
  return (
    <div className="pageWrap">
      <h1 className="pageTitle">Chess Mode ♟️</h1>

      <div className="boardOuter">
        <div className="boardInner">
          {/* YOUR CHESSBOARD COMPONENT GOES HERE */}
          <div className="boardPlaceholder">Chess Board</div>
        </div>
      </div>
    </div>
  );
}