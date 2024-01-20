"use client";
import { createContext, useContext, useEffect, useState } from "react";
import FirebaseApp from "./firebase";
import {
	getAuth,
	getRedirectResult,
	signInWithPopup,
	signInWithRedirect,
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import firebase from "./firebase";
import { initializeApp } from "@firebase/app";
type AuthContextType = {
	user: User | null;
	login: () => void;
	logout: () => void;
};
type User = {
	email: string;
	displayName: string;
    photoURL: string;
	uid: string;
};

const authContext = createContext<AuthContextType>({
	user: null,
	login: () => {},
	logout: () => {},
});

export function AuthContext({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const auth = getAuth(FirebaseApp);
	const provider = new GoogleAuthProvider();
	const login = () => {
		console.log("login");
		signInWithPopup(auth, provider).then((result) => {
			const credential = GoogleAuthProvider.credentialFromResult(result);
			console.log(credential,result);
            setUser({
                email: result.user.email||"",
                displayName: result.user.displayName||"",
                photoURL: result.user.photoURL||"",
                uid: result.user.uid,
            })
		});
	};
	const logout = () => {
		setUser(null);
	};
	const value = { user, login, logout };
	return (
		<authContext.Provider value={value}>{children}</authContext.Provider>
	);
}

export function useAuth() {
	return useContext(authContext);
}
