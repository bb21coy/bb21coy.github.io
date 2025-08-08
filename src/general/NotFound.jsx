import "../styles/notFound.scss";

function NotFound() {
	return (
		<div className="not-found">
			<img src="not-found.webp" alt="Not Found" width={"200px"} height={"200px"}/>
			<h2>Page Not Found</h2>
			<p>Quick, fall back in before the Officer notices!</p>
		</div>
	);
}

export default NotFound;