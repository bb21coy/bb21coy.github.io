import { useNavigate } from "react-router-dom"

const DashboardOptions = ({title, url=null, icon=null, image=null, func=null}) => {
    const navigate = useNavigate()

    return (
        <div onClick={url ? () => navigate(url) : func}>
            {image ? <img src={image} alt="Dashboard Icon" /> : <i className={ `fa-solid fa-${icon}` }></i>}
            <p>{title}</p>
        </div>
    )
}

export default DashboardOptions