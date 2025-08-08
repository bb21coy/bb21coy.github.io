import { Outlet } from "react-router-dom";
import Header from "./general/Header";
import Footer from "./general/Footer";
import "./styles/general.scss";
import "./styles/footer.scss"
import "./styles/header.scss"
import "./styles/errorContainer.scss"

const Layout = () => {
	return (
		<div className="layout-div">
			<div className='error-container'></div>

			<Header />
			<main>
				<Outlet /> 
			</main>
			<Footer />
		</div>
	);
};

export default Layout;
