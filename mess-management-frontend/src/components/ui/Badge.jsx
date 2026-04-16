export default function Badge({ text, color = "blue" }) {
  return (
    <span className={`px-2 py-1 text-sm rounded bg-${color}-100 text-${color}-600`}>
      {text}
    </span>
  );
}