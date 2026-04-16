export default function Button({ children, onClick, variant = "primary" }) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${styles[variant]}`}
    >
      {children}
    </button>
  );
}