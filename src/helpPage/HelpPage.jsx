import { useEffect, useState } from "react";
import HelpPageSectionContent from "./HelpPageSectionContent";
import styles from './helpPage.module.scss';
import Loading from '../general/Loading'
import { useUser } from '../general/UserContext'

function HelpPage() {
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const [accountType, setAccountType] = useState();
    const [appointment, setAppointment] = useState();

    useEffect(() => {
        if (user && user.account_name !== null) setLoading(false)

        if (user) {
            setAccountType(user.account_type);
            setAppointment(user.appointment);
        }
    }, [user])

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (loading) return <Loading />

    return (
        <div className={styles["help-page"]}>
            <div>
                <div>
                    <p>Overview</p>
                    <a onClick={(e) => scrollToSection(e, 'website-purpose')}>Website&apos;s purpose</a>
                    <a onClick={(e) => scrollToSection(e, 'features')}>Features</a>

                    <p>Home Page</p>
                    <a onClick={(e) => scrollToSection(e, 'routes')}>Routes</a>
                    <a onClick={(e) => scrollToSection(e, 'pending-tasks')}>Pending Tasks</a>

                    {(accountType !== "Boy" || appointment) && <>
                        <p>User Management</p>
                        <a onClick={(e) => scrollToSection(e, 'create-new-account')}>Create new account</a>
                        <a onClick={(e) => scrollToSection(e, 'update-existing-account')}>Update existing account</a>
                        <a onClick={(e) => scrollToSection(e, 'delete-existing-account')}>Delete existing account</a>
                    </>}

                    <p>Parade &amp; Attendance</p>
                    {(accountType !== "Boy" || appointment) && <a onClick={(e) => scrollToSection(e, 'create-parade')}>Creating a parade</a>}
                    <a onClick={(e) => scrollToSection(e, 'view-existing-parade')}>Viewing existing parade</a>
                    {(accountType !== "Boy" || appointment) && <a onClick={(e) => scrollToSection(e, 'edit-existing-parade')}>Edit existing parade</a>}
                    {(accountType !== "Boy" || appointment) && <a onClick={(e) => scrollToSection(e, 'delete-existing-parade')}>Deleting a parade</a>}
                    <a onClick={(e) => scrollToSection(e, 'download-attendance-file')}>Download attendance file</a>
                    <a onClick={(e) => scrollToSection(e, 'update-parade-attendance')}>Update parade attendance</a>

                    {(accountType !== "Boy" || appointment) && <>
                        <p>Awards Management</p>
                        <a onClick={(e) => scrollToSection(e, 'updating-awards-tracker')}>Updating awards tracker</a>
                        <a onClick={(e) => scrollToSection(e, 'award-requirements')}>Award requirements</a>

                        <p>Results Generation</p>
                        <a onClick={(e) => scrollToSection(e, 'generate-32a-results')}>Generating 32A results</a>
                    </>}

                    {accountType !== "Boy" && <>
                        <p>Uniform Inspection</p>
                        <a onClick={(e) => scrollToSection(e, 'viewing-inspection-results')}>Viewing inspection results</a>
                        <a onClick={(e) => scrollToSection(e, 'conducting-inspection')}>Conducting inspection</a>
                    </>}

                    {accountType === "Boy" && <>
                        <p>Boys&apos; Awards</p>
                        <a onClick={(e) => scrollToSection(e, 'viewing-boys-awards')}>Viewing Boys&#39; Awards</a>
                    </>}

                    {accountType === "Admin" && <>
                        <p>Developer</p>
                        <a onClick={(e) => scrollToSection(e, 'developer')}>Developer Guide</a>
                    </>}
                </div>
            </div>

            <HelpPageSectionContent accountType={accountType} appointment={appointment} styles={styles} />
        </div>
    );
}

export default HelpPage
