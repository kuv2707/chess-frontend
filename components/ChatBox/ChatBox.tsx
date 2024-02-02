"use client";
import { User, useAuth } from "@/contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import * as SocketIOClient from "socket.io-client";
import Image from "next/image";
import { toast } from "react-toastify";

type ChatMessage = {
	message: string;
	userId: string;
	timestamp: Date;
};
type ChatUser = {
	displayName: string;
	picture: string;
};

const unknownUser: User = {
	email: "unknown",
	name: "unknown",
	photoURL: "/images/guest.jpg",
	uid: "unknown",
};

export default function ChatBox({ gameId }: { gameId: string }) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [enqueuedMessages, setEnqueuedMessages] = useState<ChatMessage[]>([]);
	const latestMessageRef = useRef<HTMLDivElement>(null);
	const scrollableDiv = useRef<HTMLDivElement>(null);

	const [text, setText] = useState("");
	const { socket, user, auth } = useAuth();
	const [participants, setParticipants] = useState<User[]>([]);
	const [myself, setMyself] = useState<User>(user ?? unknownUser);
	useEffect(() => {
		if (!socket) return;
		socket.on("message", (message) => {
			console.log(message,myself);
			if (message.userId === myself.uid) {
				enqueuedMessages.unshift();
				console.log("enqueuedMessages",enqueuedMessages)
				setEnqueuedMessages(enqueuedMessages);
			}
			setMessages([...messages, message]);
		});
		return () => {
			socket.off("message");
		};
	}, [socket, messages]);
	useEffect(()=>{
		// if(!scrollableDiv.current) return;
		// scrollableDiv.current.scrollTop=scrollableDiv.current.scrollHeight;
		latestMessageRef.current?.focus();
		latestMessageRef.current?.scrollIntoView({ behavior: "smooth" });
	},[enqueuedMessages])
	useEffect(() => {
		//todo: graphql
		async function k() {
			fetch(
				process.env.NEXT_PUBLIC_MAIN_BACKEND_URL +
					"api/v1/game/" +
					gameId,
				{
					headers: {
						"Content-Type": "application/json",
						Authorization:
							"Bearer " + (await auth.currentUser?.getIdToken()),
					},
				}
			)
				.then(async (res) => {
					const { data } = await res.json();
					console.log("gameinfo", data);
					setParticipants(
						data.game.players.map((player: any) => {
							return {
								uid: player._id,
								email: player.email,
								name: player.name,
								photoURL: player.photoURL,
								idToken: "",
							} as User;
						})
					);
				})
				.catch((err) => {
					console.log(err);
					// toast.error("Error fetching game info for chat");
				});
		}
		k();
	}, []);
	async function handleAddMessage() {
		if (!user) return;
		if(text.length===0) return;
		setEnqueuedMessages([
			...enqueuedMessages,
			{
				message: text,
				userId: user.uid,
				timestamp: new Date(),
			},
		])
		setText("");
		await fetch(process.env.NEXT_PUBLIC_MAIN_BACKEND_URL + "api/v1/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization:
					"Bearer " + (await auth.currentUser?.getIdToken()),
			},
			body: JSON.stringify({ message: text, gameId }),
		});
	}

	function getUser(userId: string) {
		if (userId === user?.uid) return user;
		const participant = participants.find((p) => p.uid === userId);
		if (participant) return participant;
		return unknownUser;
	}
	if (participants.length === 0) {
		return (
			<div className="p-10">
				<h3 className="text-white text-xl mb-5">Chat</h3>
				<div className="scroll h-60 overflow-y-scroll mb-3 text-white">
					Loading...
				</div>
			</div>
		);
	}

	return (
		<div className="p-10">
			<h3 className="text-white text-xl mb-5">Chat</h3>
			<div className="scroll h-60 overflow-y-scroll mb-3" ref={scrollableDiv}>
				{[...messages, ...enqueuedMessages].map((message, i) => {
					const lmr = i === messages.length - 1 ? latestMessageRef : undefined;
					return (
						<div
							key={i}
							title={getUser(message.userId).name}
							className="text-white flex items-start"
							ref={lmr}
						>
							<Image
								alt={getUser(message.userId).name}
								src={getUser(message.userId).photoURL}
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
