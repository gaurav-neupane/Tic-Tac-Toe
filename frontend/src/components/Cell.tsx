interface CellProps {
    value: "X" | "O" | null;
    onClick: () => void;
}


export default function Cell({value , onClick}:CellProps) {
  return (
    <button className="w-14 md:w-24 h-14 md:h-24 bg-white rounded-2xl " onClick={onClick}>
        <h1 className="text-3xl md:text-6xl">{value}</h1>
    </button>
  )
}
