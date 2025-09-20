import { Component } from "react";
import styles from "./notFound.module.scss";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
        // You could also log to a service here
    }

    render() {
        if (this.state.hasError) {
            // Show your custom error page
            return (
                <div className={styles["not-found"]}>
                    <img src="error.png" alt="An Error Has Occurred" width={"200px"} height={"200px"}/>
                    <h2>An Error Has Occurred</h2>
                    <p>Please notify the developer and try again later</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
