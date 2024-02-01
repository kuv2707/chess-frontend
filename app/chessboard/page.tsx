"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Board from "./board";
import ChatBox from "@/components/ChatBox/ChatBox";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, useEffect } from "react";
import { GameInfo } from "../globaltypes";
import { toast } from "react-toastify";

export default function ChessboardPage(){
	return <>
	<Suspense fallback={<div>Loading...</div>}>
		<ChessBoard />
	</Suspense>
	</>
}
function ChessBoard() {
	const router = useRouter();
	const sps = useSearchParams();
	const gameInfo:GameInfo={
		gameId:sps.get("gameId")||"",
		player1:sps.get("player1")||"",
		player2:sps.get("player2")||""
	};
	if(!gameInfo.gameId || !gameInfo.player1 || !gameInfo.player2){
		router.push("/play");
		toast.error("Incomplete game info");
	}
	const { user } = useAuth();
	useEffect(()=>{
		if (!sps.has("gameId") || !user) {
			router.push("/play");
		}
	},[])

	return (
		<>
			<div className="flex flex-col">
				<div className="flex">
					<div>
						<Board gameInfo={gameInfo} 
						/>
					</div>
					<div>
						<ChatBox gameId={gameInfo.gameId}></ChatBox>
					</div>
				</div>
			</div>
		</>
	);
}
