import Head from "next/head";
import io from "socket.io-client";
import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";

//ローカル環境
//const backendUrl = "localhost:5000";
//商用環境
const backendUrl = "160.248.0.197:5000";

const socket = io(backendUrl);

export default function Home() {
  const [messages, setMessages] = useState("");
  const [list, setList] = useState([]);

  const handleSendMessage = () => {
    if (messages.trim() !== "") {
      socket.emit("chatMessage", { messages: messages });
      setMessages("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // バックエンドからチャット履歴を取得する関数
  const fetchChatHistory = () => {
    fetch(backendUrl + "/api/chatHistory") // バックエンドのエンドポイントを指定
      .then((response) => response.json())
      .then((data) => {
        setList(data); // 取得したチャット履歴をstateにセット
        console.log("チャット履歴を取得しました:", data);
      })
      .catch((error) => {
        console.error("チャット履歴の取得にエラーが発生しました:", error);
      });
  };

  // ページが読み込まれたときにチャット履歴を取得
  useEffect(() => {
    fetchChatHistory();
    // ソケットからの受信メッセージをリッスン
    socket.on("received_messages", (data) => {
      setList(data); // 新しいメッセージが届いたらstateを更新
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <h2>リアルタイムチャットアプリ</h2>
        <div className={styles.chatInputButton}>
          <input
            type="text"
            placeholder="チャットを入力"
            onChange={(e) => setMessages(e.target.value)}
            onKeyDown={handleKeyPress}
            value={messages}
          />
          <button onClick={() => handleSendMessage()}>送信</button>
        </div>
        {list.map((chat) => (
          <div
            className={`${styles.chatArea} ${styles.messageArea}`}
            key={chat._id}
          >
            {chat.messages}
          </div>
        ))}
      </div>
    </div>
  );
}
