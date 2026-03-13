import styles from "./notFound.module.scss";

function Migration({ link }: { link: string }) {
	return (
		<div className={styles["not-found"]}>
			<img src="not-found.webp" alt="Not Found" width={"200px"} height={"200px"}/>
			<h2>We have moved this page!</h2>
			<p>Unfortunately, this recruit has moved on to bigger and better things.</p>
            <button onClick={() => window.open(`https://portal.bb21coy.workers.dev${link}`, "_blank")}>Check out the new page</button>
        </div>
	);
}

export default Migration;