"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { GameInfo } from "../globaltypes";
import { useAuth } from "@/contexts/AuthContext";

type PieceMoves = {
	[index: string]: string[];
};

function fenString(board: string[][], turn: string) {
	let fen = "";
	for (let i = 0; i < 8; i++) {
		let empty = 0;
		for (let j = 0; j < 8; j++) {
			if (board[i][j] === "") {
				empty++;
			} else {
				if (empty != 0) {
					fen += empty;
					empty = 0;
				}
				fen += board[i][j];
			}
		}
		if (empty != 0) {
			fen += empty;
			empty = 0;
		}
		if (i != 7) fen += "/";
	}
	if (turn === "white") {
		fen += " w";
	} else {
		fen += " b";
	}
	return fen;
}
function fileName(piece: string) {
	if (piece === "") {
		return "";
	}
	return (
		(piece.toLowerCase() === piece ? "b" : "w") +
		piece.toLowerCase() +
		".svg"
	);
}
function boardFromFEN(fen: string) {
	let board = [];
	let info=fen.split(" ");
	let rows = info[0].split("/");
	console.log(rows)
	for (let i = 0; i < 8; i++) {
		let row = [];
		for (let j = 0; j < 8; j++) {
			if (rows[i][j] >= "0" && rows[i][j] <= "9") {
				for (let k = 0; k < parseInt(rows[i][j]); k++) {
					row.push("");
				}
			} else {
				if (rows[i][j]) row.push(rows[i][j]);
			}
		}
		board.push(row);
	}
	console.log(board);
	let turn="";
	if(info[1]==="b"){
		turn="black";
	}else{
		turn="white";
	}
	return {board,turn};
}
export default function ChessBoard({ gameInfo }: { gameInfo: GameInfo }) {
	//replace with api call
	let {board: initBoard, turn: initTurn}=boardFromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w");
	const [board, setBoard] = useState(
		initBoard
	);
	const [turn, setTurn] = useState(initTurn);
	const [selectedSquare, setSelectedSquare] = useState<number>(-1);
	const [allPieceMoves, setAllPieceMoves] = useState<PieceMoves>({});
	const [selectedPieceDests, setSelectedPieceDests] = useState<number[]>([]);
	const [check, setCheck] = useState(false);
	const [checkMate, setCheckMate] = useState(false);
	const [winner, setWinner] = useState(null);
	const [lastMove, setLastMove] = useState([]);
	const { user, socket } = useAuth();
	useEffect(() => {
		if (!user) return;
		fetch(
			process.env.NEXT_PUBLIC_MAIN_BACKEND_URL +
				"api/v1/game/piecewisemoves",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + user.idToken,
				},
				body: JSON.stringify({ fen: fenString(board, turn) }),
			}
		)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				setAllPieceMoves(data.data);
			});
	}, [board, turn]);
	useEffect(() => {
		socket.on("boardUpdate", function (data) {
			if (!data.fenstring) {
				return;
			}
			let newboard = boardFromFEN(data.fenstring);
			setBoard(newboard.board);
			setTurn(newboard.turn);
		});
		return function () {
			socket.off("boardUpdate");
		};
	});
	function markingColor(index: number): "kill" | "move" | null {
		if (selectedPieceDests.includes(index)) {
			if (board[Math.floor(index / 8)][index % 8] != "") {
				return "kill" as const;
			}
			return "move" as const;
		}
		return null;
	}
	function squareColor(index: number) {
		if (selectedSquare == index) {
			return "bg-green-500";
		}
		return (index + Math.floor(index / 8)) % 2 === 0
			? "bg-amber-200"
			: "bg-gray-800";
	}
	async function handleSelectSquare(index: number) {
		if (!user) {
			return;
		}

		if (selectedSquare != -1) {
			if (selectedPieceDests.includes(index)) {
				let move = moveNotation(selectedSquare, index);
				console.log(move)
				fetch(
					process.env.NEXT_PUBLIC_MAIN_BACKEND_URL +
						"api/v1/game/makemove",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + user.idToken,
						},
						body: JSON.stringify({
							gameId: gameInfo.gameId,
							move,
						}),
					}
				);
			}
			setSelectedSquare(-1);
			setSelectedPieceDests([]);
		} else {
			if (
				board[Math.floor(index / 8)][index % 8] === "" ||
				!allPieceMoves[index]
			)
				return;
			setSelectedSquare(index);
			setSelectedPieceDests(
				allPieceMoves[index].map((k) => k.substring(2)).map(encodePos)
			);
		}
	}

	return (
		<>
			<div className="grid grid-cols-8 gap-0 border-red w-96 m-5 border-r-amber-200 rounded-xl overflow-hidden">
				{board.flat().map((piece, index) => (
					<BoardSquare
						key={index}
						piece={piece}
						index={index}
						squareColor={squareColor}
						handleSelectSquare={handleSelectSquare}
						marking={markingColor(index)}
					/>
				))}
			</div>
			<TurnLabel turn={turn}></TurnLabel>
		</>
	);
}
function TurnLabel({ turn }: { turn: string }) {
	return (
		<label className="text-white m-5 bg-purple-700 p-4 rounded-lg">
			{turn === "white" ? (
				<span className="bg-white p-2 rounded text-black">
					{turn} to move
				</span>
			) : (
				<span className="bg-black p-2 rounded text-white">
					{turn} to move
				</span>
			)}
		</label>
	);
}

function encodePos(pos: string) {
	let x = pos.charCodeAt(0) - 97;
	let y = 8 - parseInt(pos[1]);
	return x + y * 8;
}
function moveNotation(from: number, to: number) {
	let x1 = from % 8;
	let y1 = 8 - Math.floor(from / 8);
	let x2 = to % 8;
	let y2 = 8 - Math.floor(to / 8);
	let move = "";
	if (x1 != x2) {
	}
	move += String.fromCharCode(x1 + 97);
	if (y1 != y2) {
	}
	move += y1;
	move += String.fromCharCode(x2 + 97);
	move += y2;
	return move;
}

function BoardSquare({
	piece,
	index,
	squareColor,
	handleSelectSquare,
	marking,
}: {
	piece: string;
	index: number;
	squareColor: Function;
	handleSelectSquare: Function;
	marking: string | null;
}) {
	function radGrad(marking: string | null) {
		if (marking === "kill") {
			return "radial-gradient(circle, rgba(255,0,0,1) 20%, rgba(255,0,0,0) 30%)";
		}
		if (marking === "move") {
			return "radial-gradient(circle, rgba(0,190,0,1) 20%, rgba(0,255,0,0) 30%)";
		}
		return "";
	}
	return (
		<div
			key={index}
			className={`w-12 h-12 ${squareColor(index)}`}
			style={{
				backgroundImage: radGrad(marking),
			}}
			onClick={() => handleSelectSquare(index)}
			onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) =>
				(e.currentTarget.style.filter = "brightness(1.5)")
			}
			onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) =>
				(e.currentTarget.style.filter = "brightness(1)")
			}
		>
			{piece && (
				<Image
					draggable={false}
					src={"/images/pieces/" + fileName(piece)}
					alt={piece}
					width={50}
					height={50}
				></Image>
			)}
		</div>
	);
}
