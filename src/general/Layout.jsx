import { useEffect, useState } from 'react'
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./general.scss";
import "./errorContainer.scss"

const Layout = () => {
	const [isOffline, setIsOffline] = useState(false)

	useEffect(() => {
		const online = () => setIsOffline(false)
		const offline = () => setIsOffline(true)

		window.addEventListener("online", online)
		window.addEventListener("offline", offline)
	}, [])

	return (
		<div className="layout">
			<div className='error-container'></div>

			<Header />
			{isOffline ? <div className='offline'>You are offline</div>: <Outlet />}
			<Footer />
		</div>
	);
};

export default Layout;
