"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";

export default function Navbar() {
	const pathname = usePathname();
	const { user, login, logout } = useAuth();
	let routesMap = {
		"/": "Home",
		"/about": "About",
		"/play": "Play",
		// "/chessboard": "Chessboard",
	};
	return (
		<nav className="bg-gradient-to-r from-blue-900 to-purple-900 p-5">
			<ul className="flex space-x-4">
				{Object.entries(routesMap).map((entry, i) => {
					return (
						<li
							key={i}
							className={" p-2 border-white text-white rounded "}
						>
							<Link href={entry[0]}>
								<button
									className={
										"p-2 border-b-2 hover:text-purple-400 " +
										(pathname === entry[0]
											? " border-purple-500"
											: "border-white")
									}
								>
									{entry[1]}
								</button>
							</Link>
						</li>
					);
				})}
				<li>
					<div className="p-2 border-2 border-white text-white rounded mx-5 inline-block">
						<Image
							width={20}
							height={20}
							className="inline-block m-2 rounded-xl"
							src={user?.photoURL || "/images/guest.jpg"}
							alt="user-dp"
						></Image>
						{user === null
							? "guest"
							: user.name.split(" ").slice(0, 2).join(" ")}
					</div>
					<button
						className="p-2 border-white text-white rounded bg-purple-700"
						onClick={user === null ? login : logout}
					>
						{user === null ? "login" : "logout"}
					</button>
				</li>
			</ul>
		</nav>
	);
}
