// app/chat/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as signalR from "@microsoft/signalr";

const hubUrl = "http://localhost:5288/chatHub";
const apiBaseUrl = "http://localhost:5288";

export default function ChatPage() {
  const router = useRouter();

  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState("");
  const [token, setToken] = useState(null);

  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // 1. Load username + token from localStorage
  useEffect(() => {
    const storedUser =
      typeof window !== "undefined"
        ? localStorage.getItem("chat_username")
        : null;
    const storedToken =
      typeof window !== "undefined" ? localStorage.getItem("chat_token") : null;

    if (!storedUser || !storedToken) {
      router.push("/login");
      return;
    }

    setUsername(storedUser);
    setToken(storedToken);
  }, [router]);

  // 2. Build SignalR connection once we have token
  useEffect(() => {
    if (!token) return;

    console.log("Connecting to SignalR hub at:", hubUrl);

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token, // JWT token
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [token]);

  // 3. Start SignalR connection + ReceiveMessage
  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected:", hubUrl);

        connection.on("ReceiveMessage", (user, msg) => {
          if (!isMounted) return;
          setMessages((prev) => [...prev, { user, message: msg }]);
        });
      } catch (err) {
        console.error("SignalR Connection Error:", err);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [connection]);

  // 4. Join room + load history
  const handleJoinRoom = async (e) => {
    e.preventDefault();
    if (!connection) {
      alert("Connection not ready yet.");
      return;
    }

    if (!room.trim()) {
      alert("Please enter a room name.");
      return;
    }

    try {
      await connection.invoke("JoinSpecificRoom", {
        username: username,
        chatRoom: room,
      });

      // load history
      try {
        const res = await fetch(
          `${apiBaseUrl}/api/messages/${encodeURIComponent(room)}`
        );
        if (res.ok) {
          const history = await res.json();
          const mapped = history.map((m) => ({
            user: m.sender,
            message: m.content,
            sentAt: m.sentAt,
            fromHistory: true,
          }));
          setMessages(mapped);
        }
      } catch (err) {
        console.error("History fetch error:", err);
      }

      setJoined(true);
    } catch (err) {
      console.error("JoinSpecificRoom error:", err);
    }
  };

  // 5. Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!connection) return;
    if (!message.trim()) return;

    try {
      await connection.invoke("SendMessage", message);
      setMessage("");
    } catch (err) {
      console.error("SendMessage error:", err);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_username");
      localStorage.removeItem("chat_token");
    }
    router.push("/login");
  };

  if (!username) {
    // while loading localStorage info
    return null;
  }

  return (
    <main className="page">
      <div className="chat-container">
        <div className="room-header">
          <span>
            Logged in as <strong>{username}</strong>
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid #1f2937",
              background: "#020617",
              color: "inherit",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Logout
          </button>
        </div>

        {!joined && (
          <form className="join-form" onSubmit={handleJoinRoom}>
            <h2>Join a Room</h2>
            <label>
              Room
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. dev"
              />
            </label>

            <button type="submit" disabled={!connection}>
              {connection ? "Join Room" : "Connecting..."}
            </button>
          </form>
        )}

        {joined && (
          <>
            <div className="room-header">
              <span>
                Room: <strong>{room}</strong>
              </span>
            </div>

            <div className="messages">
              {messages.length === 0 && (
                <div className="no-messages">No messages yet</div>
              )}

              {messages.map((m, index) => (
                <div
                  key={index}
                  className={`message ${
                    m.user === username ? "own-message" : ""
                  }`}
                >
                  <div className="message-user">
                    {m.user}
                    {m.fromHistory && (
                      <span style={{ fontSize: "10px", opacity: 0.6 }}>
                        {" "}
                        (history)
                      </span>
                    )}
                  </div>
                  <div className="message-text">{m.message}</div>
                </div>
              ))}
            </div>

            <form className="send-form" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
