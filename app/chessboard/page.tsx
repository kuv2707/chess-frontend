"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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

export default function ChessBoard() {
	//replace with api call
	const [board, setBoard] = useState([
		["r", "n", "b", "q", "k", "b", "n", "r"],
		["p", "p", "p", "p", "p", "p", "p", "p"],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["", "", "", "", "", "", "", ""],
		["P", "P", "P", "P", "P", "P", "P", "P"],
		["R", "N", "B", "Q", "K", "B", "N", "R"],
	]);
	const [turn, setTurn] = useState("white");
	const [selectedSquare, setSelectedSquare] = useState<number>(-1);
	const [allPieceMoves, setAllPieceMoves] = useState<PieceMoves>({});
	const [selectedPieceDests, setSelectedPieceDests] = useState<number[]>([]);
	const [check, setCheck] = useState(false);
	const [checkMate, setCheckMate] = useState(false);
	const [winner, setWinner] = useState(null);
	const [lastMove, setLastMove] = useState([]);

	useEffect(() => {
		fetch("http://localhost:8000/piecewisemoves", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ fen: fenString(board, turn) }),
		})
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				setAllPieceMoves(data);
			});
	}, [board, turn]);

	function squareColor(index: number) {
		if (selectedPieceDests.includes(index)) {
			return "bg-green-500";
		}
		if (selectedSquare == index) {
			return "bg-green-500";
		}
		return (index + Math.floor(index / 8)) % 2 === 0
			? "bg-amber-200"
			: "bg-gray-800";
	}
	function handleSelectSquare(index: number) {
		if (selectedSquare != -1) {
			if (selectedPieceDests.includes(index)) {
				setBoard((board) => {
					let newboard = JSON.parse(JSON.stringify(board));
					newboard[Math.floor(selectedSquare / 8)][
						selectedSquare % 8
					] = "";
					newboard[Math.floor(index / 8)][index % 8] =
						board[Math.floor(selectedSquare / 8)][
							selectedSquare % 8
						];
					return newboard;
				});
				setTurn(turn === "white" ? "black" : "white");
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
	return (
		<div className="grid grid-cols-8 gap-0 border-red w-96 m-5 border-r-amber-200 rounded-xl overflow-hidden">
			{board.flat().map((piece, index) => (
				<div
					key={index}
					className={`w-12 h-12 ${squareColor(index)}`}
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
			))}
		</div>
	);
}

function encodePos(pos: string) {
	let x = pos.charCodeAt(0) - 97;
	let y = 8 - parseInt(pos[1]);
	return x + y * 8;
}
