import type { FC } from "react";
import { useNavigate } from "react-router-dom"
import styles from './dashboardPage.module.scss'

type DashboardOptionsProps = {
    title: string;
    url: string;
    icon: string;
    color: string;
    description: string;
    migrating?: boolean;
}

const DashboardOptions: FC<DashboardOptionsProps> = ({ title, url, icon, color, description, migrating = false }) => {
    const navigate = useNavigate()
    const isMigrating = () => migrating ? window.open(`https://portal.bb21coy.workers.dev${url}`, "_blank") : navigate(url)

    return (
        <div className={styles.route} style={{ '--color': `#${color}` } as React.CSSProperties} onClick={isMigrating}>
            <div>
                <i className={`fa-regular fa-${icon}`}></i>
            </div>
            <p>{title}</p>
            <p>{description}</p>
        </div>
    )
}

export default DashboardOptions