import Cell from "./Cell";

interface BoardProps{
  board: ("X" | "O" | null)[];
  makeMove: (id:number) => void;
}

export default function Board({board , makeMove}:BoardProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {board.map((value, index) => (
        <Cell value={value} key={index} onClick={()=>makeMove(index)}/>
      ))}
    </div>
  )
}
