"use client";
import { createContext, useContext, useEffect, useState } from "react";
import FirebaseApp from "./firebase";
import {
	UserCredential,
	getAuth,
	signInWithPopup,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { socket } from "@/components/socketio";
import * as SocketIOClient from "socket.io-client";
type AuthContextType = {
	user: User | null;
	login: () => void;
	logout: () => void;
	socket: SocketIOClient.Socket;
};
export type User = {
	email: string;
	displayName: string;
	photoURL: string;
	uid: string;
};

const authContext = createContext<AuthContextType>({
	user: null,
	login: () => {},
	logout: () => {},
	socket: socket,
});

export function AuthContext({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const auth = getAuth(FirebaseApp);
	const provider = new GoogleAuthProvider();
	useEffect(() => {
		const result = localStorage.getItem("result");
		if (result) {
			const parsed = JSON.parse(result);
			loginFromResult(parsed);
		}
	}, []);
	function loginFromResult(result: UserCredential){
		const credential = GoogleAuthProvider.credentialFromResult(result);
		if (result.user.uid) {
			socket.connect();
			socket.emit("login", result.user);
			console.log("connected socket");
			setUser({
				email: result.user.email || "",
				displayName: result.user.displayName || "",
				photoURL: result.user.photoURL || "",
				uid: result.user.uid,
			});
		}
	}
	const login = () => {
		console.log("login");
		signInWithPopup(auth, provider).then((result) => {
			localStorage.setItem("result", JSON.stringify(result));
			loginFromResult(result);
		});
	};
	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		socket.disconnect();
	};
	const value = { user, login, logout, socket };
	return (
		<authContext.Provider value={value}>{children}</authContext.Provider>
	);
}

export function useAuth() {
	return useContext(authContext);
}
