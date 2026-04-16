export default function Notification({ message }) {
  return (
    <div className="bg-yellow-300 p-3 rounded shadow mb-2">
      {message}
    </div>
  );
}