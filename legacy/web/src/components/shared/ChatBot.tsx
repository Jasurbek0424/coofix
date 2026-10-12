"use client";

import { useState, useRef, useEffect } from "react";
import { FaRobot } from "react-icons/fa";
import { FiX } from "react-icons/fi";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AI_GREETING =
  "Здравствуйте! 👋 Я AI-помощник COOFIX.STORE. Чем могу помочь? Задайте вопрос о товарах, доставке или компании.";

const STORAGE_KEY = "coofix-chat-messages";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  // Load messages from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      } catch {
        /* ignore */
      }
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: AI_GREETING }]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const chatMessages = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatMessages }),
      });

      const data = await res.json();
      const reply = data.message || "Не удалось получить ответ. Попробуйте позже.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Ошибка соединения. Проверьте интернет и попробуйте снова.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-20 left-auto right-4 z-40 h-14 w-14 sm:bottom-6 sm:right-6">
          <span
            className="absolute inset-0 rounded-full bg-orange animate-ping opacity-40"
            aria-hidden
          />
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl chatbot-btn-pulse"
            aria-label="Открыть чат с AI"
          >
            <FaRobot size={26} className="drop-shadow-sm" />
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed left-4 right-4 bottom-4 z-50 flex min-h-[55vh] max-h-[80vh] flex-col overflow-hidden rounded-xl border border-gray bg-dark shadow-2xl sm:min-h-0 sm:left-auto sm:right-6 sm:bottom-6 sm:h-[420px] sm:w-[360px]">
          <div className="flex items-center justify-between border-b border-gray px-4 py-3">
            <span className="flex items-center gap-2 font-semibold text-foreground">
              <FaRobot size={18} className="text-orange" />
              AI-помощник
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded p-1 text-foreground transition-colors hover:bg-gray/20"
              aria-label="Закрыть"
            >
              <FiX size={20} />
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-orange text-white"
                      : "bg-gray/30 text-foreground"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl bg-gray/30 px-4 py-2 text-sm text-foreground">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Напишите сообщение..."
                className="flex-1 rounded-lg border border-gray bg-background px-4 py-2 text-sm text-foreground placeholder:text-smoky focus:border-orange focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="rounded-lg bg-orange px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
