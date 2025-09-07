import { useEffect, useState } from "react";
import HelpPageSectionContent from "./HelpPageSectionContent";
import styles from './helpPage.module.scss';
import Loading from '../general/Loading'
import { useUser } from '../general/UserContext'

function HelpPage() {
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const accountType = user?.account_type ?? null;
    const appointment = user?.appointment ?? null;

    useEffect(() => {
        if (user && user.account_name !== null) setLoading(false)
    }, [user])

    if (loading) return <Loading />

    return (
        <div className={styles["help-page"]}>
            <div>
                <div>
                    <p>Overview</p>
                    <a href="#website-purpose">Website&apos;s purpose</a>
                    <a href="#features">Features</a>

                    <p>Home Page</p>
                    <a href="#routes">Routes</a>
                    <a href="#pending-tasks">Pending Tasks</a>

                    {(accountType !== "Boy" || appointment) && <>
                        <p>User Management</p>
                        <a href="#create-new-account">Create new account</a>
                        <a href="#update-existing-account">Update existing account</a>
                        <a href="#delete-existing-account">Delete existing account</a>
                    </>}

                    <p>Parade &amp; Attendance</p>
                    {(accountType !== "Boy" || appointment) && <a href="#create-parade">Creating a parade</a>}
                    <a href="#view-existing-parade">Viewing existing parade</a>
                    {(accountType !== "Boy" || appointment) && <a href="#edit-existing-parade">Edit existing parade</a>}
                    <a href="#download-attendance-file">Download attendance file</a>
                    <a href="#update-parade-attendance">Update parade attendance</a>

                    {(accountType !== "Boy" || appointment) && <>
                        <p>Awards Management</p>
                        <a href="#updating-awards-tracker">Updating awards tracker</a>
                        <a href="#award-requirements">Award requirements</a>

                        <p>Results Generation</p>
                        <a href="#generate-32a-results">Generating 32A results</a>
                    </>}

                    {accountType !== "Boy" && <>
                        <p>Uniform Inspection</p>
                        <a href="#viewing-inspection-results">Viewing inspection results</a>
                        <a href="#conducting-inspection">Conducting inspection</a>
                    </>}

                    {accountType === "Boy" && <>
                        <p>Boys&apos; Awards</p>
                        <a href="#viewing-boys-awards">Viewing Boys&#39; Awards</a>
                    </>}

                    {accountType === "Admin" && <>
                        <p>Developer</p>
                        <a href="#developer">Developer Guide</a>
                    </>}
                </div>
            </div>

            <HelpPageSectionContent accountType={accountType} appointment={appointment} styles={styles} />
        </div>
    );
}

export default HelpPage
