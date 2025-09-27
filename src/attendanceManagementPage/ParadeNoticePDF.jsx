import { useEffect, useState } from 'react';
import styles from './paradeNoticePDF.module.scss';
import { doc, getDoc, Timestamp } from '@firebase/firestore';
import { db } from '../firebase';

const ParadeNoticePDF = ({ parade }) => {
    const day = parade.date.toDate().toLocaleDateString("en-US", { weekday: "long" });
    const date = parade.date.toDate().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    const [roles, setRoles] = useState({})

    useEffect(() => {
        Object.entries(parade.appointments).map(async ([role, user]) => {
            const userRef = await getDoc(doc(db, 'users', user.id))
            if (!userRef.exists()) return
            const account = userRef.data()
            setRoles(prev => ({ ...prev, [role]: account }))
        })
    }, [parade])

    useEffect(() => {
        function applyZoom() {
            const container = document.getElementById('pdf-container');
            const target = document.getElementById('parade-notice-pdf');

            if (container && target) {
                const zoomLevel = container.clientWidth / 1123;
                target.style.transform = `scale(${zoomLevel})`;
                container.style.setProperty('--scale', zoomLevel);
            }
        }

        window.addEventListener('resize', applyZoom);
        applyZoom();

        return () => window.removeEventListener("resize", applyZoom);
    }, [parade]);

    const formatTime = (time) => {
        if (!(time instanceof Timestamp)) throw new Error(`Invalid time format. Its type is ${typeof time}, not Timestamp.`);
        const date = time.toDate();

        if (parade.parade_type === "Camp") return date.toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
        else return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    const formatProgramTime = (time) => {
        if (!(time instanceof Timestamp)) throw new Error(`Invalid time format. Its type is ${typeof time}, not Timestamp.`);
        const date = time.toDate();
        return date.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <>
            <div className={styles["pdf-container"]} id='pdf-container'>
                <div className={styles['parade-notice-pdf']} id='parade-notice-pdf'>
                    <div className={styles.header}>
                        <img src="bb-crest.png" alt="Logo" style={{ width: "50px", height: "50px" }} />
                        <div>
                            <p><b>THE BOYS' BRIGADE</b></p>
                            <p><b>21st SINGAPORE COMPANY</b></p>
                            <p>GEYLANG METHODIST SCHOOL (SECONDARY)</p>
                        </div>
                        <div>
                            <p>This hope we have as an anchor of the soul, a hope both</p>
                            <p><strong>sure and stedfast</strong> and one which enters within the veil</p>
                            <p>where Jesus has entered as a forerunner for us...</p>
                            <p>Hebrews 6:19-20a</p>
                        </div>
                    </div>

                    <section className={styles.title}>
                        <h1>parade notice</h1>
                        <h2>{date}, {day}</h2>
                    </section>

                    <section className={styles.details}>
                        <p>Venue: <b>{parade.venue}</b></p>
                        <p></p>
                        <p>Reporting Time: <b>{formatTime(parade.reporting_time)}</b></p>
                        <p>Dismissal Time: <b>{formatTime(parade.dismissal_time)}</b></p>
                    </section>

                    <section className={styles.roles}>
                        <p>Duty Teacher:</p>
                        <span>{roles.DT?.honorifics ?? roles.DT?.rank} {roles.DT?.account_name}</span>
                        <p>COS:</p>
                        <span>{roles.COS?.rank} {roles.COS?.account_name}</span>
                        <p>CSM:</p>
                        <span>{roles.CSM?.rank} {roles.CSM?.account_name}</span>
                        <p>Duty Officer:</p>
                        <span>{roles.DO?.honorifics ?? roles.DO?.rank} {roles.DO?.account_name}</span>
                        <p>Flag Bearer:</p>
                        <span>{roles["Flag Bearer"]?.rank} {roles["Flag Bearer"]?.account_name}</span>
                        <p>CE:</p>
                        <span>{roles["CE Sergeant"]?.rank} {roles["CE Sergeant"]?.account_name}</span>
                    </section>

                    <section className={styles.company_announcements}>
                        <p>Company Announcements</p>
                        {parade.company_announcements.length > 0 ? (
                            <ol>
                                {parade.company_announcements.map(announcement => <li key={announcement.id}>{announcement.announcement}</li>)}
                            </ol>
                        ) : <p>No Company Announcements</p>}
                    </section>

                    <section className={styles.programs_container}>
                        {["1", "2", "3", "4/5"].map(platoon => (
                            <div className={styles.programs} key={platoon}>
                                <div>
                                    <h2>Sec 1 platoon</h2>
                                    <h3>Program</h3>
                                    {parade.platoon_programs[platoon].map(program => (
                                        <p key={program.id}>{formatProgramTime(program.start_time)} - {formatProgramTime(program.end_time)}: {program.program}</p>
                                    ))}
                                </div>
                                <div>
                                    <h3>Platoon Announcements</h3>
                                    <div>
                                        <p>Attire:</p>
                                        <span>{parade[`sec-${platoon}-attire`] ?? "NIL"}</span>
                                    </div>

                                    <ul>
                                        {parade.platoon_announcements[platoon].length > 0 && parade.platoon_announcements[platoon].map(announcement => (
                                            <li key={announcement.id}>{announcement.announcement}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </section>

                    <footer>
                        <p>Page | 1 of 1</p>
                        <p>Version 2025_v1.0</p>
                    </footer>
                </div>
            </div>

            <div className={styles["parade-description"]}>
                <label htmlFor="parade-description">Description:</label>
                <textarea disabled value={parade.description} placeholder='Parade Description' id="parade-description"></textarea>
            </div>
        </>
    )
}

export default ParadeNoticePDF