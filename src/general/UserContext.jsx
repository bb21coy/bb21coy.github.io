import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
	const [user, setUser] = useState({ account_type: "Boy", appointment: null, account_name: null });
	const [loggedIn, setLoggedIn] = useState(false);
	const [navigationViewable, setNavigationViewable] = useState(false)

	return (
		<UserContext.Provider value={{ user, setUser, loggedIn, setLoggedIn, navigationViewable, setNavigationViewable }}>
			{children}
		</UserContext.Provider>
	);
}

export function useUser() {
	return useContext(UserContext);
}