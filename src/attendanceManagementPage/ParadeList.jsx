import { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import ExportButton from './AnnualAttendanceFile'
import { db } from '../firebase'
import { onSnapshot, orderBy, collection, query } from '@firebase/firestore'
import { useUser } from '../general/UserContext'
import styles from './paradeList.module.scss'

const ParadeList = ({ setPageState }) => {
    const { user } = useUser()
    const [parades, setParades] = useState([])
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, "parades"), orderBy("date", "desc")), (snapshot) => {
            setParades(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        })

        return () => unsub()
    }, [])

    useEffect(() => {
        if (["Admin", "Officer", "Primer", "CSM", "DY CSM", "Admin Sergeant"].includes(user.account_type)) setPageState("form")
        else {
            if (parades.length > 0) setPageState(parades[parades.length - 1]?.id)
        }
    }, [user]);

    function changeYear(direction) {
        if (currentYear + parseInt(direction) < 1984 || currentYear + parseInt(direction) > (new Date().getFullYear())) return
        setCurrentYear(currentYear + parseInt(direction))
    }

    return (
        <div className={styles['parade-list']}>
            <div>
                <div className={styles.header}>
                    <div>
                        <i className='fa-solid fa-chevron-left' onClick={() => changeYear("-1")} aria-label='Previous Year'></i>
                        <h2>{currentYear}</h2>
                        <i className='fa-solid fa-chevron-right' onClick={() => changeYear("1")} aria-label='Next Year'></i>
                    </div>
                    <div>
                        {(["Admin", "Officer", "Primer"].includes(user.account_type) || ["CSM", "DY CSM", "Admin Sergeant"].includes(user.appointment)) &&
                            <i className='fa-solid fa-file-plus' onClick={() => setPageState('form')} title='Add Parade'></i>
                        }
                        <ExportButton key={currentYear} year={parseInt(currentYear)} />
                    </div>
                </div>
                <div className={styles['parade-list-container']} id='parade-list-container'>
                    {parades.filter((parade) => parade.date.toDate().getFullYear() == currentYear).map((parade) => (
                        <Fragment key={parade.id}>
                            <input type="radio" id={parade.id} name="parade" onChange={() => setPageState(parade.id)} />
                            <label htmlFor={parade.id}>{parade.date.toDate().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</label>
                        </Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}

ParadeList.propTypes = {
    setPageState: PropTypes.func.isRequired
}

export default ParadeList