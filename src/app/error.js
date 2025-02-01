"use client";
import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Error in /:", error);
  }, [error]);

  return (
    <div className="p-8">
      <h2 className="text-xl text-red-500 mb-4">Something went wrong!</h2>
      <button
        onClick={() => reset()}
        className="bg-blue-600 text-white px-3 py-2 rounded"
      >
        Try again
      </button>
    </div>
  );
}
