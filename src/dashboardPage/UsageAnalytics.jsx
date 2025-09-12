import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./dashboardPage.module.scss"
import { showMessage } from "../general/handleServerError";

const AdminUsageAnalytics = () => {
    const [vercelUsage, setVercelUsage] = useState([]);
    const titleMap = {
        "Fluid Active CPU": "CPU Used",
        "Fluid Provisioned Memory": "Memory Reserved",
        "Edge Requests": "Edge Requests",
        "Edge Request CPU Duration": "Edge CPU Time",
        "Function Invocations": "Function Calls",
        "Fast Data Transfer": "Data Out",
        "Fast Origin Transfer": "Data In"
    };

    const init = async () => {
        try {
            const resp = await axios.get(`usage.json`);
            let usage = resp.data.data.usage;
            const keysToRemove = ["ISR Reads", "ISR Writes", "Function Duration"];
            usage = usage.filter(item => !keysToRemove.includes(item.title));
            const simplified = usage.map(item => ({
                ...item,
                title: titleMap[item.title] || item.title
            }));

            setVercelUsage(simplified);
        } catch (err) {
            console.error(err);
            showMessage("Cannot fetch Vercel Usage");
        }
    }

    useEffect(() => {
        init();
    }, []);

    return (
        <div className={styles["vercel-usage"]}>
            {vercelUsage.map((item, index) => (
                <div key={index}>
                    <p>{item.title}</p>
                    <span className="ring" style={{ background: `conic-gradient(#ff5733 0deg ${item.value / item.limit * 360}deg, #ccc ${item.value / item.limit * 360}deg 360deg)` }}></span>
                    <p>{(item.value / item.limit * 100).toFixed(2)}%</p>
                </div>
            ))}
        </div>
    )
};

export default AdminUsageAnalytics