import { useNavigate } from "react-router-dom"
import styles from './dashboardPage.module.scss'

const DashboardOptions = ({title, url=null, icon=null, image=null, func=null, color="000000", description=""}) => {
    const navigate = useNavigate()

    return (
        <div className={styles.route} style={{ '--color': `#${color}` }} onClick={url ? () => navigate(url) : func}>
            <div>
                {image ? <div src={image} alt="Dashboard Icon" /> : <i className={ `fa-regular fa-${icon}` }></i>}
            </div>
            <p>{title}</p>
            <p>{description}</p>
        </div>
    )
}

export default DashboardOptions