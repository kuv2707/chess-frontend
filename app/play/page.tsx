"use client";
import { useEffect, useState } from "react";
import ChessBoard from "../chessboard/board";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";

export default function GameOptions() {
	const [gameId, setGameId] = useState("");
	const [hostedGameId, setHostedGameId] = useState("");
	const { socket, user } = useAuth();
	const router = useRouter();
	useEffect(() => {
		socket.on("opponentJoined", (data) => {
			const sps = new URLSearchParams(data.gameInfo);
			router.push("/chessboard?" + sps.toString());
		});
		return () => {
			socket.off("opponentJoined");
		};
	}, []);
	const hostGame = async () => {
		if (user === null) return;
		const res = await fetch(
			process.env.NEXT_PUBLIC_MAIN_BACKEND_URL + "api/v1/game/newgame",
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + user.idToken,
				},
			}
		);
		const game = await res.json();
		if (game.status === "fail") {
			toast.error(game.message);
			return;
		}
		setHostedGameId(game.data.id);
	};

	const joinGame = async () => {
		if (user === null) return;
		const res = await fetch(
			process.env.NEXT_PUBLIC_MAIN_BACKEND_URL + "api/v1/game/joingame",
			{
				method: "POST",
				body: JSON.stringify({ gameId }),
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + user.idToken,
				},
			}
		);
		if (res.status != 200) {
			const { message } = await res.json();
			toast.error(message);
			setGameId("");
		} else {
			// const response = await res.json();
			// const sps = new URLSearchParams(response.data);
			// router.push("/chessboard?" + sps.toString());
		}
	};

	function copyHandler(e) {
		e.preventDefault();
		navigator.clipboard.writeText(hostedGameId);
		toast.success("Copied to clipboard");
	}

	return (
		<form className="flex flex-col items-center justify-center space-y-4 m-5">
			<button
				type="button"
				onClick={hostGame}
				disabled={user === null}
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
			>
				Host a Game
			</button>
			{hostedGameId && (
				<div className="p-3 text-white bg-blue-600 rounded-md">
					{hostedGameId}
					<button onClick={copyHandler} className="p-3 ml-3 bg-black rounded shadow-lg shadow-black" >Copy</button>
				</div>
			)}

			<div className="flex space-x-2">
				<input
					type="text"
					value={gameId}
					onChange={(e) => setGameId(e.target.value)}
					placeholder="Enter game ID"
					className="px-2 py-1 bg-gray-800 text-white rounded"
				/>
				<button
					type="button"
					onClick={joinGame}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				>
					Join a Game
				</button>
			</div>
		</form>
	);
}
