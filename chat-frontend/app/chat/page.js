// app/chat/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as signalR from "@microsoft/signalr";

// === BACKEND URLs ===
const API_BASE_URL = "http://localhost:5288";
const HUB_URL = `${API_BASE_URL}/chatHub`;

// internal room name for pair of users (NOT shown to UI)
function getPrivateRoomName(user1, user2) {
  const sorted = [user1, user2].sort();
  return `private-${sorted[0]}-${sorted[1]}`;
}

// default avatar initials
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "?";
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ChatPage() {
  const router = useRouter();

  const [username, setUsername] = useState(null);
  const [token, setToken] = useState(null);

  const [connection, setConnection] = useState(null);

  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // 1. Load auth info from localStorage
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

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(conn);
  }, [token]);

  // 3. Start connection and setup ReceiveMessage
  useEffect(() => {
    if (!connection) return;

    let isMounted = true;

    const start = async () => {
      try {
        await connection.start();
        console.log("SignalR connected:", HUB_URL);

        connection.on("ReceiveMessage", (user, msg) => {
          if (!isMounted) return;
          setMessages((prev) => [...prev, { user, message: msg }]);
        });
      } catch (err) {
        console.error("SignalR connection error:", err);
      }
    };

    start();

    return () => {
      isMounted = false;
      connection.stop();
    };
  }, [connection]);

  // 4. Load contacts (all users except current)
  useEffect(() => {
    if (!token) return;

    const loadContacts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Failed to load users");
          return;
        }

        const data = await res.json(); // array of usernames
        setContacts(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadContacts();
  }, [token]);

  // 5. When clicking a contact: join private room + load history
  const handleSelectContact = async (contact) => {
    if (!connection || !username) return;

    const room = getPrivateRoomName(username, contact);

    try {
      // Join internal room on server
      await connection.invoke("JoinSpecificRoom", {
        username: username,
        chatRoom: room,
      });

      // Load message history for that room
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/messages/${encodeURIComponent(room)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const history = await res.json();
          const mapped = history.map((m) => ({
            user: m.sender,
            message: m.content,
            sentAt: m.sentAt,
          }));
          setMessages(mapped);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("History fetch error:", err);
        setMessages([]);
      }

      setSelectedContact(contact);
      setCurrentRoom(room);
    } catch (err) {
      console.error("JoinSpecificRoom error:", err);
    }
  };

  // 6. Send message to selected contact
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!connection || !currentRoom || !messageInput.trim()) return;

    try {
      await connection.invoke("SendMessage", messageInput);
      setMessageInput("");
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
    return null; // simple loading state
  }

  return (
    <main className="page">
      <div className="chat-container" style={{ display: "flex", gap: 16 }}>
        {/* LEFT: contacts list */}
        <div
          style={{
            width: 220,
            borderRight: "1px solid #1f2937",
            paddingRight: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 13 }}>
            Logged in as <strong>{username}</strong>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="outline-button"
          >
            Logout
          </button>

          <h3 style={{ fontSize: 15, margin: "4px 0" }}>Contacts</h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flex: 1,
              overflowY: "auto",
            }}
          >
            {contacts.length === 0 && (
              <div className="small-text">No contacts yet</div>
            )}
            {contacts.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectContact(c)}
                className={
                  selectedContact === c
                    ? "contact-btn contact-btn--active"
                    : "contact-btn"
                }
              >
                <div className="contact-item">
                  <div className="avatar">{getInitials(c)}</div>
                  <div className="contact-name">{c}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: chat area with selected user */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {!selectedContact && (
            <div className="small-text">
              Select a contact on the left to start chatting.
            </div>
          )}

          {selectedContact && (
            <>
              <div className="room-header">
                <span>
                  Chat with <strong>{selectedContact}</strong>
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
                    <div className="message-user">{m.user}</div>
                    <div className="message-text">{m.message}</div>
                  </div>
                ))}
              </div>

              <form className="send-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${selectedContact}...`}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
