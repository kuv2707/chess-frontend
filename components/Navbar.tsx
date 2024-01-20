"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
	const pathname = usePathname();
	const { user, login, logout } = useAuth();
	let routesMap = {
		"/": "Home",
		"/about": "About",
		"/chessboard": "Game",
	};
	return (
		<nav className="bg-gradient-to-r from-blue-900 to-purple-900 p-5">
			<ul className="flex space-x-4">
				{Object.entries(routesMap).map((entry, i) => {
					return (
						<li
							key={i}
							className={
								" p-2 border-white text-white rounded " +
								(pathname === entry[0] ? "bg-purple-700" : "")
							}
						>
							<Link href={entry[0]}>{entry[1]}</Link>
						</li>
					);
				})}
				<li>
					<button
						className="p-2 border-white text-white rounded bg-yellow-700"
						onClick={user === null ? login : logout}
					>
						{user === null ? "login" : "logout"}
					</button>
					<label className="p-2 border-2 border-white text-white rounded m-5">
						{user === null ? "guest" : user.displayName}
					</label>
				</li>
			</ul>
		</nav>
	);
}
