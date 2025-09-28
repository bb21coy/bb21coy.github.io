import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import "./general.scss";
import "./errorContainer.scss"
import "./icons.css"

const Layout = () => {
	return (
		<div className="layout">
			<div className='error-container'></div>

			<Header />
			<Outlet />
			<Footer />
		</div>
	);
};

export default Layout;
