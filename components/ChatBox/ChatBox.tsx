"use client";
import { User, useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import * as SocketIOClient from "socket.io-client";
import Image from "next/image";

type ChatMessage = {
	message: string;
	user: User;
	timestamp: Date;
};

export default function ChatBox() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState("");
	const { socket, user } = useAuth();
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
		if (!user) return;
		socket.emit("message", text);
		setMessages([
			...messages,
			{
				message: text,
				user: {
					email: user.email,
					displayName: user.displayName,
					photoURL: user.photoURL,
					uid: user.uid,
				},
				timestamp: new Date(),
			},
		]);
		setText("");
	}

	return (
		<div>
			{messages.map((message, i) => {
				return (
					<div key={i}>
						<Image
							alt={message.user.displayName}
							src={message.user.photoURL}
							width={50}
							height={10}
							className="inline-block rounded-xl mb-2 mr-5"
						></Image>
						{message.message}
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
