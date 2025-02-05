import React, { useState, useEffect } from "react";
import './Chat.css'
import GreenAPI from "../../store/greenAPI.tsx";

const Chat: React.FC = () => {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [currentChat, setCurrentChat] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ text: string; sender: string }[]>([]);
    const authData = GreenAPI

    const createChat = () => {
        if (phoneNumber) {
            setCurrentChat(phoneNumber);
            setMessages([]);
        }
    };

    const sendMessage = async () => {
        if (!currentChat || !message) return;

        const chatId = `${currentChat}@c.us`;
        try {
            await fetch(
                `https://api.green-api.com/waInstance${authData.idInstance}/sendMessage/${authData.apiTokenInstance}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chatId, message }),
                }
            );
            setMessages((prev) => [...prev, { text: message, sender: "Вы" }]);
            setMessage("");
        } catch (error) {
            console.error("Ошибка отправки:", error);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await fetch(`https://api.green-api.com/waInstance${authData.idInstance}/receiveNotification/${authData.apiTokenInstance}`);

            const data = await res.json();

            if (data && data.body) {
                const receivedMessage = data.body.messageData?.textMessageData?.textMessage;
                const sender = data.body.senderData?.chatId?.replace("@c.us", "");

                if (receivedMessage && sender === currentChat) {
                    setMessages((prev) => [...prev, { text: receivedMessage, sender: "Собеседник" }]);
                }
            }
        } catch (error) {
            console.error("Ошибка получения:", error);
        }
    };

    useEffect(() => {
        if (currentChat) {
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [currentChat]);

    return (
        <div>
            {!currentChat ? (
                <>
                    <h2>Создать чат</h2>
                    <input
                        type="text"
                        placeholder="Номер телефона (79001234567)"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <button onClick={createChat}>Создать чат</button>
                </>
            ) : (
                <>
                    <h2>Чат с {currentChat}</h2>
                    <div>
                        {messages.map((msg, index) => (
                            <p key={index} style={{ textAlign: msg.sender === "Вы" ? "right" : "left" }}>
                                <b>{msg.sender}:</b> {msg.text}
                            </p>
                        ))}
                    </div>
                    <input type="text" placeholder="Сообщение" value={message} onChange={(e) => setMessage(e.target.value)} />
                    <button onClick={sendMessage}>Отправить</button>
                </>
            )}
        </div>
    );
};

export default Chat;
