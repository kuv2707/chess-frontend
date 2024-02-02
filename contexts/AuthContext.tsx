"use client";
import { createContext, useContext, useEffect, useState } from "react";
import FirebaseApp from "./firebase";
import {
	Auth,
	UserCredential,
	browserLocalPersistence,
	getAuth,
	getIdToken,
	onAuthStateChanged,
	setPersistence,
	signInWithPopup,
	signOut,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { socket } from "@/components/socketio";
import * as SocketIOClient from "socket.io-client";
import { toast } from "react-toastify";
type AuthContextType = {
	user: User | null;
	login: () => void;
	logout: () => void;
	socket: SocketIOClient.Socket;
	auth: Auth;
};
export type User = {
	email: string;
	name: string;
	photoURL: string;
	uid: string;
};

const authContext = createContext<AuthContextType>({
	user: null,
	login: () => {},
	logout: () => {},
	socket: socket,
	auth: getAuth(FirebaseApp),
	
});

export function AuthContext({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const auth = getAuth(FirebaseApp);
	const provider = new GoogleAuthProvider();
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			console.log("auth state changed",user)
			if (user) {
				const token = await user.getIdToken();
				const resp = await fetch(
					process.env.NEXT_PUBLIC_MAIN_BACKEND_URL +
						"api/v1/auth/login",
					{
						method: "POST",
						body: JSON.stringify({ token }),
						headers: {
							"Content-Type": "application/json",
						},
					}
				).then((res) => res.json());
				if (resp.status == "fail") {
					toast.error(resp.message);
					return;
				}
				toast.success("Logged in as " + user.displayName);
				socket.auth={token};
				socket.connect();
				resp.data.user.uid=resp.data.user._id;
				setUser(resp.data.user);
			} else {
				setUser(null);
				socket.disconnect();
			}
		});

		return () => unsubscribe();
	}, []);
	const login = () => {
		setPersistence(auth, browserLocalPersistence).then(()=>{
			signInWithPopup(auth, provider);
		}).catch((error) => {	
			console.log(error);
		});
	};
	const logout = () => {
		signOut(auth);
	};
	const value = { user, login, logout, socket, auth };
	return (
		<authContext.Provider value={value}>{children}</authContext.Provider>
	);
}

export function useAuth() {
	return useContext(authContext);
}
