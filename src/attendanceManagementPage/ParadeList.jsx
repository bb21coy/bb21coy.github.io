import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { HandleDownloadWithExcelJS } from './AnnualAttendanceExcel'
import { db } from '../firebase'
import { onSnapshot, orderBy, collection, query } from '@firebase/firestore'
import { useUser } from '../general/UserContext'

const ParadeList = ({ setPageState }) => {
    const { user } = useUser()
    const [accountType, setAccountType] = useState();
    const [appointment, setAppointment] = useState();
    const [parades, setParades] = useState([])
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    useEffect(() => {
        const unsub = onSnapshot(query(collection(db, "parades"), orderBy("date", "desc")), (snapshot) => {
            setParades(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
        })

        return () => unsub()
    }, [])

    useEffect(() => {
        if (user) {
            setAccountType(user.account_type);
            setAppointment(user.appointment);
        }

        if (["Admin", "Officer", "Primer", "CSM", "DY CSM", "Admin Sergeant"].includes(user.account_type)) setPageState("form")
        else {
            if (parades.length > 0) setPageState(String(parades[parades.length - 1]?.id))
        }
    }, [user]);

    function showNewParadeForm() {
        setPageState('form')
    }

    function showParadeInformation(e) {
        setPageState(e.target.className)
    }

    function changeYear(direction) {
        if (currentYear + parseInt(direction) < 1984 || currentYear + parseInt(direction) > (new Date().getFullYear())) return
        setCurrentYear(currentYear + parseInt(direction))
    }

    return (
        <div className='parade-list'>
            <div>
                <div>
                    <div>
                        <button onClick={() => { changeYear("-1") }} aria-label='Previous Year'>
                            <i className='fa-solid fa-chevron-left'></i>
                        </button>
                        <h1>{currentYear}</h1>
                        <button onClick={() => { changeYear("1") }} aria-label='Next Year'>
                            <i className='fa-solid fa-chevron-right'></i>
                        </button>
                    </div>
                    <div>
                        {["Admin", "Officer", "Primer", "CSM", "DY CSM", "Admin Sergeant"].includes(accountType) &&
                            <button onClick={showNewParadeForm}><i className='fa-solid fa-plus'></i>New</button>
                        }
                        <HandleDownloadWithExcelJS key={currentYear} year={currentYear} />
                    </div>
                </div>
                <div id='parade-list-container'>
                    {parades.filter((parade) => parade.date.toDate().getFullYear() == currentYear).map((parade) => (
                        <button tabIndex={0} key={parade.id} className={parade.id} onClick={showParadeInformation}>{parade.date.toDate().toLocaleDateString('en-GB')}</button>
                    ))}
                </div>
            </div>
        </div>
    )
}

ParadeList.propTypes = {
    accountType: PropTypes.string.isRequired,
    appointment: PropTypes.string,
    setPageState: PropTypes.func.isRequired,
    reload: PropTypes.bool.isRequired
}

export { ParadeList }