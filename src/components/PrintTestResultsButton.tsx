"use client";

export function PrintTestResultsButton({ label, fileName }: { label: string; fileName: string }) {
  return (
    <button
      className="btn btn-secondary no-print"
      type="button"
      onClick={() => {
        const previous = document.title;
        document.title = fileName;
        const restore = () => {
          document.title = previous;
          window.removeEventListener("afterprint", restore);
        };
        window.addEventListener("afterprint", restore);
        window.print();
      }}
    >
      {label}
    </button>
  );
}
