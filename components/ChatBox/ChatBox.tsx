"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import * as SocketIOClient from "socket.io-client";

type ChatMessage = {
	message: string;
	user: string;
	timestamp: Date;
};

export default function ChatBox() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState("");
	const { socket } = useAuth();
	useEffect(() => {
		if (!socket) return;
		socket.on("message", (message: ChatMessage) => {
			setMessages([...messages, message]);
		});
		return () => {
			socket.off("message");
		};
	}, [socket, messages]);
	function handleAddMessage() {
		socket.emit("message", text);
        setMessages([...messages, {message: text, user: "me", timestamp: new Date()}]);
		setText("");
	}

	return (
		<div>
			{messages.map((message, i) => {
				return (
					<div key={i}>
						{message.user}: {message.message}
					</div>
				);
			})}
			{
				<>
					<input
						type="text"
						className="text-black"
						value={text}
						onChange={(e) => setText(e.target.value)}
						onKeyDown={(
							e: React.KeyboardEvent<HTMLInputElement>
						) => {
							if (e.key === "Enter") {
								handleAddMessage();
							}
						}}
					/>
					<button onClick={handleAddMessage}></button>
				</>
			}
		</div>
	);
}
