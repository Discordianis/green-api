import React, {useState, useEffect, useRef, Suspense} from "react";
import './Chat.css';
import GreenAPI from "../../store/greenAPI.tsx";
import Loading from "../../components/Loading/Loading.tsx";
import useInput from "../../hooks/useInput.tsx";
import useSuccess from "../../hooks/useSuccess.tsx";
import Button from "../../components/Button/Button.tsx";
import addChatImg from '../../../public/add_chat.svg';
import settingsImg from '../../../public/settings.svg';
import searchImg from '../../../public/search.svg';
import bgChat from '../../../public/bg-chat.svg';
import sendImg from '../../../public/send.svg';
import doneImg from '../../../public/done.svg';
import doneAllImg from '../../../public/done_all.svg';
import {SetSettings} from "../../api/SetSettings.tsx";

interface IChatListInfo {
    avatar?: string;
    id?: string;
    name?: string;
    last_message?: string | null;
    phone?: string;
}

interface IChatList {
    [key: number]: IChatListInfo;
}

interface ICheck {
    existsWhatsapp?: boolean;
}

interface IProfileInfo {
    avatar: string;
    name: string;
    contactName: string;
    chatId: string;
    lastSeen: string | null;
}

export interface IMessages {
    type?: string | 'incoming' | 'outgoing'
    idMessage?: string
    timestamp: number
    typeMessage?: string
    chatId?: string
    textMessage?: string
    extendedTextMessage?: ExtendedTextMessage
    statusMessage?: string
    sendByApi?: boolean
    deletedMessageId?: string
    editedMessageId?: string
    isEdited?: boolean
    isDeleted?: boolean
    receiptId?: string
}

export interface ExtendedTextMessage {
    text: string
    description: string
    title: string
    previewType: string
    jpegThumbnail: string
    forwardingScore: number
    isForwarded: boolean
}

const Chat: React.FC = () => {
    const phoneNumber = useInput('');
    const searchInput = useInput('');
    const messageInput = useInput('')
    const [messages, setMessages] = useState<IMessages[]>([]);
    const [chatList, setChatList] = useState<IChatList | null>(null);
    const [currentChat, setCurrentChat] = useState<IChatListInfo | null>(null);
    const [createNewChat, setCreateNewChat] = useState<boolean>(false);
    const {NotificationComponent, showNotification} = useSuccess();
    const [pending, setPending] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const authData = GreenAPI;
    const [newUserData, setNewUserData] = useState<IChatListInfo | null>(null);
    const chatRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDisabled, setIsDisabled] = useState(false);

    const body = document.body;

    const handleInput = () => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    };

    useEffect(() => {
        SetSettings().then()
    }, [authData]);

    useEffect(() => {
        const local = localStorage.getItem("chatList");

        if (local) {
            try {
                const parsedChatList: { [key: string]: IChatList } = JSON.parse(local);
                setChatList(parsedChatList[authData.idInstance]);
            } catch (error) {
                console.error("Ошибка при парсинге chatList:", error);
                localStorage.setItem("chatList", JSON.stringify({}));
            }
        } else {
            localStorage.setItem("chatList", JSON.stringify({}));
        }
        setLoading(false)
    }, [authData]);

    useEffect(() => {
        if (newUserData) {
            const local = localStorage.getItem("chatList");
            const updatedChatList: Record<string, Record<string, IChatListInfo>> = local ? JSON.parse(local) : {};

            if (!updatedChatList[authData.idInstance]) {
                updatedChatList[authData.idInstance] = {};
            }

            updatedChatList[authData.idInstance][newUserData.id!] = newUserData;

            localStorage.setItem("chatList", JSON.stringify(updatedChatList));
            setChatList(updatedChatList[authData.idInstance]);
            setNewUserData(null);
        }
    }, [newUserData, authData]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.style.backgroundImage = `url('${bgChat}')`;
            chatRef.current.style.backgroundSize = 'auto';
            chatRef.current.style.backgroundBlendMode = 'overlay';
        }

        if (body) {
            body.style.background = '#d9d6d2';
        }
    }, [chatRef.current, body, chatList]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const createChatResponse = async () => {
        if (!phoneNumber.value) {
            return
        }

        setPending(true);
        try {
            const res = await fetch(`https://api.green-api.com/waInstance${authData?.idInstance}/checkWhatsapp/${authData?.apiTokenInstance}`, {
                method: 'POST',
                body: JSON.stringify({phoneNumber: phoneNumber.value}),
            });

            const data: ICheck = await res.json();
            if (data.existsWhatsapp) {
                const resProfile = await fetch(`https://api.green-api.com/waInstance${authData?.idInstance}/getContactInfo/${authData?.apiTokenInstance}`, {
                    method: 'POST',
                    body: JSON.stringify({chatId: phoneNumber.value + '@c.us'}),
                });

                const dataProfile: IProfileInfo = await resProfile.json();
                if (dataProfile) {
                    setNewUserData({
                        avatar: dataProfile?.avatar,
                        id: dataProfile?.chatId,
                        name: dataProfile?.name,
                        phone: phoneNumber.value,
                        last_message: null
                    });
                }
            } else {
                showNotification('Такого номера не существует в базе WhatsApp!', "error");
            }
        } catch (e) {
            console.error('Ошибка:', e);
            showNotification('Произошла ошибка. Подробности в консоли.', "error");
        } finally {
            setPending(false);
            phoneNumber.setValue('')
        }
    };

    const sendMessage = async () => {
        if (!currentChat || !messageInput.value.trim()) {
            return;
        }

        const tempId = `temp_${Date.now()}`;
        const newMessage = {
            type: 'outgoing' as const,
            chatId: currentChat.id,
            textMessage: messageInput.value.trim(),
            timestamp: Date.now(),
            idMessage: tempId,
            statusMessage: 'pending',
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);

        try {
            const response = await fetch(`https://api.green-api.com/waInstance${authData?.idInstance}/sendMessage/${authData?.apiTokenInstance}`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId: currentChat?.id,
                    message: messageInput.value.trim(),
                }),
            });

            const data = await response.json();
            if (data.idMessage) {
                setMessages(prev => prev.map(msg =>
                    msg.idMessage === tempId ? { ...msg, idMessage: data.idMessage, statusMessage: 'sent' } : msg
                ));
            }
        } catch (error) {
            setMessages(prev => prev.map(msg =>
                msg.idMessage === tempId ? { ...msg, statusMessage: 'error' } : msg
            ));
            console.error("Ошибка отправки:", error);
            showNotification('Произошла ошибка. Подробности в консоли.', "error");
        }

        messageInput.setValue('');
    };


    useEffect(() => {
        console.log(messages)
    }, [messages]);


    const fetchMessages = async () => {
        try {
            const res = await fetch(
                `https://api.green-api.com/waInstance${authData?.idInstance}/receiveNotification/${authData?.apiTokenInstance}`
            );
            const data = await res.json();

            if (!data || !data.body) return;

            const message = data.body;

            if (message.typeWebhook === "incomingMessageReceived") {
                const newIncomingMessage: IMessages = {
                    type: 'incoming',
                    idMessage: message.idMessage,
                    chatId: message.senderData.chatId,
                    textMessage: message.messageData?.textMessageData?.textMessage,
                    timestamp: message.timestamp,
                };

                // Проверка на дубликат
                setMessages(prev => {
                    const isDuplicate = prev.some(msg => msg.idMessage === newIncomingMessage.idMessage);
                    if (!isDuplicate) {
                        return [...prev, newIncomingMessage];
                    }
                    return prev;
                });
            } else if (message.typeWebhook === "outgoingMessageStatus") {
                const { idMessage, status } = message;
                setMessages(prev => prev.map(msg =>
                    msg.idMessage === idMessage ? { ...msg, statusMessage: status } : msg
                ));
            }

            await deleteNotification(data.receiptId);
        } catch (error) {
            console.error("Ошибка при запросе:", error);
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [currentChat]);

    const deleteNotification = async (receiptId: number) => {
        if (!receiptId) {
            return
        }
        try {
            await fetch(
                `https://api.green-api.com/waInstance${authData?.idInstance}/deleteNotification/${authData?.apiTokenInstance}/${receiptId}`,
                { method: "DELETE" }
            );
            console.log(`Уведомление ${receiptId} удалено.`);
        } catch (error) {
            console.error("Ошибка при удалении уведомления:", error);
        }
    };

    useEffect(() => {
        if (currentChat) {
            const interval = setInterval(async () => {
                await fetchMessages();
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [currentChat]);

    const handleCurrentChat = (id: string) => {
        if (chatList) {
            const currChat = Object.values(chatList).find((find: IChatListInfo) => find?.id === id)
            if (currChat) {
                setCurrentChat(currChat)
                console.log(currentChat)
            }
        }
    }

    useEffect(() => {
        if (currentChat) {
            const messagesRes = async () => {
                try {
                    const res = await fetch(`https://api.green-api.com/waInstance${authData?.idInstance}/getChatHistory/${authData?.apiTokenInstance}`, {
                        method: 'POST',
                        body: JSON.stringify({chatId: currentChat?.id})
                    });
                    const data = await res.json()
                    if (data) {
                        setMessages(data.reverse())
                    }
                } catch (e) {
                    console.log('Error: ', e)
                }
            }
            messagesRes().then()
        }
    }, [currentChat]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && messageInput.value.length > 0) {
            e.preventDefault();
            sendMessage().then()
        }
    };

    const handleClick = (chatId: string) => {
        if (isDisabled) return;
        setIsDisabled(true);
        handleCurrentChat(chatId);
        setTimeout(() => {
            setIsDisabled(false);
        }, 2000);
    };

    if (loading) {
        return <Loading/>;
    }

    return (
        <div className="chat_root">
            <Suspense fallback={<Loading/>}>
                <div className="chat_right_bar_root">
                    <div className="right_bar_header">
                        <h3>Чаты</h3>
                        <div className="right_bar_header_actions">
                            <Button title="Новый чат" onClick={() => setCreateNewChat(true)}>
                                <img src={addChatImg} alt="addChat"/>
                            </Button>
                            <Button title="Настройки">
                                <img src={settingsImg} alt="settings"/>
                            </Button>
                        </div>
                    </div>
                    <div className="right_bar_search">
                        {createNewChat ? (
                            <input type="text" value={phoneNumber.value} onChange={(e) => phoneNumber.onChange(e)}
                                   placeholder="Введите номер телефона (79281239865)"/>
                        ) : chatList ? (
                            <>
                                <img src={searchImg} alt="search"/>
                                <input type="text" value={searchInput.value} onChange={(e) => searchInput.onChange(e)}
                                       placeholder="Поиск чата..."/>
                            </>
                        ) : null}
                    </div>
                    {createNewChat &&
                        <div className="nothing_chats_create_buttons">
                            <Button onClick={() => setCreateNewChat(false)}>Отмена</Button>
                            <Button onClick={createChatResponse} disabled={pending}>Создать</Button>
                        </div>
                    }
                    {!chatList &&
                        <div className="nothing_chats">
                            <span>Нет ни одного чата...</span>
                            <Button onClick={() => setCreateNewChat(true)}>Создать чат</Button>
                        </div>
                    }
                    <div className="right_bar_chatlist">
                        {chatList && (
                            Object.values(chatList).map((chat: IChatListInfo, index) => (
                                <div key={index} onClick={() => handleClick(chat.id as string)}
                                style={{pointerEvents: isDisabled ? 'none' : 'auto', opacity: isDisabled ? '0.5' : '1'}}>
                                    <img src={chat.avatar} alt="user_avatar"/>
                                    <div>
                                        <h4>{chat.name ? chat.name : chat.phone}</h4>
                                        <span>{chat.last_message}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className={'chat_left_root'}>
                    <div className={'chat_left_header'}>
                        {currentChat ?
                            <div className={'chat_left_header_content'}>
                                <div>
                                    <img src={currentChat?.avatar} alt={'avatar'}/>
                                </div>
                                <div>
                                    <span>{currentChat?.name ? currentChat?.name : currentChat?.phone}</span>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    <div className={'chat_left_content'} id={'chat_left_content'} ref={chatRef}>
                        {currentChat && messages ?
                            <div>
                                {Object.values(messages).map((message: IMessages, index) =>
                                    message.type === 'outgoing' ?
                                        <div className={'outgoing_message'} key={index}>
                                            <div>
                                                <span aria-hidden="true" className="rmk7">
                                                    <svg
                                                        viewBox="0 0 8 13" height="13" width="8"
                                                        preserveAspectRatio="xMidYMid meet" className="" version="1.1"
                                                        x="0px"
                                                        y="0px" enableBackground="new 0 0 8 13">
                                                        <title>tail-out</title>
                                                        <path opacity="0.13"
                                                              d="M5.188,1H0v11.193l6.467-8.625 C7.526,2.156,6.958,1,5.188,1z"/>
                                                        <path fill="currentColor"
                                                              d="M5.188,0H0v11.193l6.467-8.625C7.526,1.156,6.958,0,5.188,0z"/>
                                                    </svg>
                                                </span>
                                                <span className={'message_text'}>{message.textMessage}</span>
                                                <span className={message?.statusMessage === 'read' ? 'msg_done_all' : 'msg_done'}>
                                                    {message.statusMessage === 'read' ? (
                                                        <img src={doneAllImg} alt={'done'}/>
                                                    ) : message.statusMessage === 'sent' ? (
                                                        <img src={doneImg} alt={'done'}/>
                                                    ) : (
                                                        <span className="pending-status">🕒</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        :
                                        <div className={'ingoing_message'}>
                                            <div>
                                                <span aria-hidden="true" className="lmk7">
                                                    <svg
                                                        viewBox="0 0 8 13" height="13" width="8"
                                                        preserveAspectRatio="xMidYMid meet" className="" version="1.1"
                                                        x="0px"
                                                        y="0px" enableBackground="new 0 0 8 13">
                                                        <title>tail-in</title>
                                                        <path opacity="0.13" fill="#0000000"
                                                              d="M1.533,3.568L8,12.193V1H2.812 C1.042,1,0.474,2.156,1.533,3.568z"/>
                                                        <path fill="currentColor"
                                                              d="M1.533,2.568L8,11.193V0L2.812,0C1.042,0,0.474,1.156,1.533,2.568z"/>
                                                    </svg>
                                                </span>
                                                <span>{message.textMessage}</span>
                                            </div>

                                        </div>
                                )}
                            </div>
                            :
                            <div className={'nothing_chats_left'}>
                                <span>Выберите чат или создайте новый.</span>
                            </div>
                        }
                    </div>
                    {currentChat &&
                        <div className={'chat_left_message_input'}>
                            <textarea ref={textareaRef} onKeyDown={handleKeyDown} onInput={handleInput}
                                      value={messageInput.value} onChange={(e) => messageInput.onChange(e)}
                                      placeholder={'Написать сообщение...'}/>
                            <img src={sendImg} alt={'send'} onClick={sendMessage}/>
                        </div>
                    }
                </div>
                <NotificationComponent/>
            </Suspense>
        </div>
    );
};

export default Chat;
