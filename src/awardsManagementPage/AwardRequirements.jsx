import { useState } from 'react'
import styles from './awardRequirements.module.scss'
import Loading from '../general/Loading'

const AwardRequirements = () => {
    const [loading, setLoading] = useState(true)

    return (
        <div className={styles["award-requirements-container"]}>
            {loading && <Loading />}

            <iframe onLoad={() => setLoading(false)} src="https://1drv.ms/w/c/3203de19ba2d6dd7/IQRJE06bY0LMS4W0HPxdqVBuAYE4Tw4C3FoztKai56U9usk?em=2&amp;wdPrint=0" className={styles["award-requirements"]}></iframe>
        </div>
    )
}

export default AwardRequirements