"use client";

import { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!message.trim()) return;

    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setReply(data.reply || data.error);
    setLoading(false);
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chatbot</h1>

      <textarea
        className="w-full border p-2 rounded"
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask something..."
      />

      <button
        onClick={sendMessage}
        className="mt-3 bg-black text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      {reply && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <strong>Reply:</strong>
          <p>{reply}</p>
        </div>
      )}
    </main>
  );
}
