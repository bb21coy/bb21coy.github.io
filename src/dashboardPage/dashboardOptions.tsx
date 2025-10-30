import type { FC } from "react";
import { useNavigate } from "react-router-dom"
import styles from './dashboardPage.module.scss'

interface DashboardOptionsProps {
    title: string;
    url?: string | null;
    icon?: string | null;
    image?: string | null;
    func?: (() => void) | null;
    color?: string;
    description?: string;
}

const DashboardOptions: FC<DashboardOptionsProps> = ({ title=null, url=null, icon=null, image=null, func=null, color="000000", description="" }) => {
    const navigate = useNavigate()

    return (
        <div className={styles.route} style={{ '--color': `#${color}` } as React.CSSProperties} onClick={url ? () => navigate(url) : func || undefined}>
            <div>
                {image ? <div /> : <i className={ `fa-regular fa-${icon}` }></i>}
            </div>
            <p>{title}</p>
            <p>{description}</p>
        </div>
    )
}

export default DashboardOptions