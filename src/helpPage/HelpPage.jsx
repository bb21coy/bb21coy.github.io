import { useEffect, useState } from "react";
import HelpPageSectionContent from "./HelpPageSectionContent";
import axios from "axios";
import BASE_URL from "../Constants";
import '../styles/helpPage.scss';
import { handleServerError } from '../general/handleServerError'

function HelpPage() {
    const [accountType, setAccountType] = useState(null);
    const [appointment, setAppointment] = useState(null);

    useEffect(() => {
        async function init() {
            try {
                const account = await axios.get(`${BASE_URL}/account`, { headers: { "x-route": "/get_own_account" }, withCredentials: true })
                setAccountType(account.data.account_type);
                setAppointment(account.data.appointment);
            } catch (err) {
                handleServerError(err.response.status);
            }
        }

        init()
    }, []);

    return (
        <div className="help-page">
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

            <HelpPageSectionContent accountType={accountType} appointment={appointment} />
        </div>
    );
}

export default HelpPage
