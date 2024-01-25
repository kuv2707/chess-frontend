"use client";
import { User, useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import * as SocketIOClient from "socket.io-client";
import Image from "next/image";

type ChatMessage = {
	message: string;
	user: ChatUser;
	timestamp: Date;
};
type ChatUser = {
	displayName: string;
	picture: string;
};

export default function ChatBox({gameId}: { gameId: string}) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [text, setText] = useState("");
	const { socket, user } = useAuth();
	useEffect(() => {
		if (!socket) return;
		socket.on("message", (message: ChatMessage) => {
			console.log(message)
			setMessages([...messages, message]);
		});
		return () => {
			socket.off("message");
		};
	}, [socket, messages]);
	async function handleAddMessage() {
		if (!user) return;
		await fetch(process.env.NEXT_PUBLIC_MAIN_BACKEND_URL + "api/v1/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + user.idToken,
			},
			body: JSON.stringify({ message: text,
				gameId
			 }),
		})
		setText("");
	}

	return (
		<div className="p-10">
			<h3 className="text-white text-xl mb-5">Chat</h3>
			<div className="scroll h-60 overflow-y-scroll mb-3">
				{messages.map((message, i) => {
					return (
						<div
							key={i}
							title={message.user.displayName}
							className="text-white flex"
						>
							<Image
								alt={message.user.displayName}
								src={message.user.picture}
								width={50}
								height={10}
								className="inline-block rounded-xl mb-2 mr-5 border-white"
							></Image>
							<div className="inline-block">
								{message.message}
							</div>
						</div>
					);
				})}
			</div>
			{
				<>
					<input
						type="text"
						className=" p-2 bg-gray-800 text-white rounded"
						placeholder="Write a message"
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
