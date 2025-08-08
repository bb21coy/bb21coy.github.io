import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/adminAnalytics.scss"
import { handleServerError } from "../general/handleServerError";
import BASE_URL from "../Constants";

const AdminUsageAnalytics = () => {
    const [frontendCommits, setFrontendCommits] = useState([]);
    const [backendCommits, setBackendCommits] = useState([]);
    const [vercelUsage, setVercelUsage] = useState([]);
    const [refreshTimer, setRefreshTimer] = useState(60);

    useEffect(() => {
        const init = async () => {
            try {
                const resp = await axios.get(`https://api.github.com/repos/bb21coy/bb21coy.github.io/commits?per_page=5&sha=master`, { headers: { authorization: process.env.GITHUB_TOKEN } });
                const resp1 = await axios.get(`https://api.github.com/repos/bb21coy/bb-website-v3/commits?per_page=5&sha=main`, { headers: { authorization: process.env.GITHUB_TOKEN } });
                const resp2 = await axios.get(`${BASE_URL}/admin`, { headers: { "x-route": "/vercel_usage" }, withCredentials: true });

                console.log(resp2.data);
                setVercelUsage(resp2.data);

                const filteredCommits = resp.data.map(item => ({
                    commit: item.commit,
                    committer: item.committer
                }));
                setFrontendCommits(filteredCommits);

                const filteredCommits1 = resp1.data.map(item => ({
                    commit: item.commit,
                    committer: item.committer
                }));
                setBackendCommits(filteredCommits1);
            } catch (err) {
                console.error(err);
                handleServerError(err?.response?.status);
            }

        }

        init();

        const interval = setInterval(() => {
            setRefreshTimer(refreshTimer => refreshTimer - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    useEffect(() => {
        if (refreshTimer === 0) {
            axios.get(`${BASE_URL}/admin`, { headers: { "x-route": "/vercel_usage" }, withCredentials: true })
                .then(resp => setVercelUsage(resp.data))
                .catch(err => {
                    console.error(err);
                    handleServerError(err?.response?.status);
                })

            setRefreshTimer(60);
        }
    }, [refreshTimer]);

    return (
        <>
            <div className="vercel-usage-header">
                <h3 className="commit-title">Vercel Usage</h3>
                <span className="vercel-timer" style={{ background: `conic-gradient(#ff5733 0deg ${refreshTimer / 60 * 360}deg, #ccc ${refreshTimer / 60 * 360}deg 360deg)` }}></span>
            </div>
            <div className="vercel-usage">
                {vercelUsage.map((item, index) => (
                    <div key={index} className="vercel">
                        <p>{item.title}</p>
                        <div>
                            <span className="ring" style={{ background: `conic-gradient(#ff5733 0deg ${item.value / item.limit * 360}deg, #ccc ${item.value / item.limit * 360}deg 360deg)` }}></span>
                            <div>
                                <p>{item.value}/{item.limit}</p>
                                <p>{(item.value / item.limit * 100).toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="commit-title">Frontend Commits</h3>
            {frontendCommits.map((item, index) => (
                <div key={index} className="commit">
                    <div>
                        <p>{item.commit.message}</p>
                        <p>{new Date(item.commit.author.date).toLocaleString()}</p>
                    </div>
                    <div>
                        <img src={item.committer.avatar_url} alt="Committer Avatar" />
                        <p>{item.commit.author.name}</p>
                    </div>
                </div>
            ))}

            <h3 className="commit-title">Backend Commits</h3>
            {backendCommits.map((item, index) => (
                <div key={index} className="commit">
                    <div>
                        <p>{item.commit.message}</p>
                        <p>{new Date(item.commit.author.date).toLocaleString()}</p>
                    </div>
                    <div>
                        <img src={item.committer.avatar_url} alt="Committer Avatar" />
                        <p>{item.commit.author.name}</p>
                    </div>
                </div>
            ))}
        </>
    )
};

export default AdminUsageAnalytics