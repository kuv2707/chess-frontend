"use client";

import { useState } from "react";
import Image from "next/image";

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
	const [selectedPieceMoves, setSelectedPieceMoves] = useState([]);
	const [check, setCheck] = useState(false);
	const [checkMate, setCheckMate] = useState(false);
	const [winner, setWinner] = useState(null);
	const [lastMove, setLastMove] = useState([]);
	function squareColor(index: number) {
		if (selectedSquare == index) {
			return "bg-green-500";
		}
		return (index + Math.floor(index / 8)) % 2 === 0
			? "bg-white"
			: "bg-gray-300";
	}
	function handleSelectSquare(index: number) {
		if (selectedSquare != -1) {
			setBoard((board) => {
				let newboard = JSON.parse(JSON.stringify(board));
				newboard[Math.floor(selectedSquare / 8)][selectedSquare % 8] =
					"";
				newboard[Math.floor(index / 8)][index % 8] =
					board[Math.floor(selectedSquare / 8)][selectedSquare % 8];
				return newboard;
			});
			setSelectedSquare(-1);
		} else {
            if(board[Math.floor(index / 8)][index % 8] === "") return;
			setSelectedSquare(index);
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
				>
					{piece && (
						<Image
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
