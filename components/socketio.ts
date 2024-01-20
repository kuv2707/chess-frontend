import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_MAIN_BACKEND_URL || "http://localhost:5000";

export const socket = io(URL, {
	autoConnect: false,
});
