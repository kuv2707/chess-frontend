import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./../components/Navbar";
import { AuthContext } from "@/contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Chesssss!",
	description: "Chess by kuv2707",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={inter.className}>
				<ToastContainer />
				<AuthContext>
					<Navbar />
					<div className="px-20">
						{children}
					</div>
				</AuthContext>
			</body>
		</html>
	);
}
