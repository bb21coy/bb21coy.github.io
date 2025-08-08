import HelpPageSteps from "./HelpPageSteps";
import PropTypes from "prop-types";

const create_new_account_steps = [
    {
        name: "Click on the 'Create New Account' button",
        image: "help24.png"
    },
    {
        name: "Fill out the form and submit",
        image: "help23.png"
    }
]

const update_existing_account_steps = [
    {
        name: "Click on the account that you wish to update",
        image: "help1.png"
    },
    {
        name: "Update the form with new information and submit",
        image: "help2.png"
    }
]

const delete_account_steps = [
    {
        name: "Click on the account that you wish to delete",
        image: "help21.png"
    },
    {
        name: "Click on the 'Delete Account' button",
        image: "help22.png"
    }
]

const create_parade_steps = [
    {
        name: "Click on the 'Add' button",
        image: "help2.png"
    },
    {
        name: "Fill out the form",
        image: "help1.png"
    },
    {
        name: "Click on the 'Create Parade' button",
        image: "help4.png"
    },
    {
        name: "Parade created successfully",
        image: "help3.png"
    }
]

const view_existing_parade_steps = [
    {
        name: "Select the year that the parade took place",
        image: "help7.png"
    },
    {
        name: "Click on the parade that you wish to view",
        image: "help8.png"
    },
    {
        name: "Parade Notice in PDF would be displayed",
        image: "help9.png"
    }
]

const edit_existing_parade_steps = [
    {
        name: "Click on the year that the parade took place",
        image: "help7.png"
    },
    {
        name: "Select the parade that you wish to update",
        image: "help6.png"
    },
    {
        name: "Click on 'Edit Parade Notice'",
        image: "help5.png"
    },
    {
        name: "Update the form with new information and submit",
        image: "help8.png"
    }
]

const delete_parade_steps = [
    {
        name: "Click on the year that the parade took place",
        image: "help7.png"
    },
    {
        name: "Select the parade that you wish to delete",
        image: "help6.png"
    },
    {
        name: "Click on the 'Edit Parade Notice' button",
        image: "help5.png"
    },
    {
        name: "Click on the 'Delete Parade Notice' button",
        image: "help9.png"
    },
    {
        name: "Parade Notice deleted successfully",
        image: "help10.png"
    }
]

const generate_32a_results_steps = [
    {
        name: "Select an award",
        image: "help13.png"
    },
    {
        name: "Select an instructor",
        image: "help12.png"
    },
    {
        name: "Select the boys who passed the award",
        image: "help11.png"
    },
    {
        name: "Certain awards may require you to fill in additional information",
        image: "help14.png"
    },
    {
        name: "Click on the 'Generate Results' button",
        image: "help11.png"
    },
    {
        name: "32A results in PDF would be displayed",
        image: "help15.png"
    }
]

const conducting_inspection_steps = [
    {
        name: "Click on the 'Conduct Inspection' button",
        image: "help17.png"
    },
    {
        name: "Select the boys that you wish to inspect",
        image: "help20.png"
    },
    {
        name: "Check the boxes when the boy has fulfilled the listed criteria",
        image: "help18.png"
    },
    {
        name: "After finish the boy's inspection, use the drop down to switch to the next boy",
        image: "help19.png"
    },
    {
        name: "Only when all boys have been inspected, click on the 'Finish Inspection' button",
        image: "help16.png"
    }
]

function HelpPageSectionContent({ accountType, appointment }) {
    return (
        <div className="help-page-section-content">
            <section className="help-page-section">
                <h2>Overview</h2>
                
                <h3 id="website-purpose">Website&apos;s purpose</h3>
                <p>BB 21<sup>st</sup> Portal is a website designed for Officers, Primers and Boys to facilitate administrative workflow</p>

                <h3 id="features">Features</h3>
                <p>BB 21<sup>st</sup> Portal currently supports the following features:</p>
                <ul>
                    <li>Provides an overview of all members, including Officers, Primers, current and graduated boys</li>
                    <li>Creating and updating Parade Notices</li>
                    <li>Keeping track of Parade Attendance</li>
                    <li>Keeping track of Boys&apos; Awards</li>
                    <li>Providing a description and guide to complete awards from the company&apos;s perspective</li>
                    <li>Generating 32A results in PDF format through a simplified form</li>
                    <li>Conducting Uniform Inspections based on a list of criterias</li>
                    <li>Allowing Boys to see their attained awards</li>
                </ul>
                <p><strong>In this help page, you would only be able to see the guide to pages that you have access to</strong></p>
            </section>

            <section>
                <h2>Home Page</h2>

                <h3 id="routes">Routes</h3>
                <p>Home Page contains the following routes depending on the account type:</p>
                <div className="help-page-table">
                    <p></p>
                    <p>Boy (w/o appt)</p>
                    <p>Boy (w/ appt)</p>
                    <p>Primer</p>
                    <p>Officer</p>

                    <p>Boy&apos;s Awards</p>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-xmark"></i></div>

                    <p>User Management</p>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Awards Management</p>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Results Generation</p>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Uniform Inspection</p>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-xmark"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Parade &amp; Attendance</p>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Reset Login Infomation</p>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>

                    <p>Log out</p>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                    <div><i className="fa-solid fa-check"></i></div>
                </div>

                <p><strong>Note that certain account types may have more privileges compared to others even if a page is accessible to multiple account types</strong></p>
            
                <h3 id="pending-tasks">Pending Tasks</h3>
                <p>Home Page displays the following pending tasks (if any):</p>
                <ul>
                    <li><strong>Upcoming Parade Notice:</strong> There is an upcoming Parade on DD MM YYYY</li>
                    <li><strong>Role in upcoming Parade:</strong> You are the <i>COS</i> for the DD MM YYYY Parade</li>
                </ul>

                <p>If no pending tasks are found, a message will be displayed stating &quot;No Pending Tasks&quot;</p>
            </section>

            {(accountType !== "Boy" || appointment) && <section>
                <h2>User Management</h2>

                <h3 id="create-new-account">Create new account</h3>
                <div>
                    <HelpPageSteps steps={create_new_account_steps} />
                </div>

                <h3 id="update-existing-account">Update existing account</h3>
                <div>
                    <HelpPageSteps steps={update_existing_account_steps} />
                </div>

                <h3 id="delete-existing-account">Delete existing account</h3>
                <div>
                    <HelpPageSteps steps={delete_account_steps} />
                </div>
            </section>}

            <section>
                <h2>Parade &amp; Attendance</h2>

                {(accountType !== "Boy" || appointment) && <>
                <h3 id="create-parade">Creating a parade</h3>
                <div>
                    <HelpPageSteps steps={create_parade_steps} />
                </div>
                </>}

                <h3 id="view-existing-parade">Viewing existing parade</h3>
                <div>
                    <HelpPageSteps steps={view_existing_parade_steps} />
                </div>
            
                {(accountType !== "Boy" || appointment) && <>
                <h3 id="edit-existing-parade">Edit existing parade</h3>
                <div>
                    <HelpPageSteps steps={edit_existing_parade_steps} />
                </div>
                <p><strong>Note that the editing of a parade is only accessible by Officers, Primers, and Boys (with appointment) account types</strong></p>
                <p><strong>The editing of a parade must be done before finalisation</strong></p>
                
                <h3>Delete existing parade</h3>
                <div>
                    <HelpPageSteps steps={delete_parade_steps} />
                </div>
                </>}

                <h3 id="download-attendance-file">Download attendance file</h3>
                <ol>
                    <li>Select the year that you wish to download the attendance file</li>
                    <li>Click the &quot;Attendance&quot; button</li>
                    <li>The attendance file will be downloaded</li>
                </ol>
                <p><strong>Note that the attendance file is only available from 2025 onwards</strong></p>

                <h3 id="update-parade-attendance">Update parade attendance</h3>
                <ol>
                    <li>Click the parade that you wish to update</li>
                    <li>Scroll down until you see the Parade Attendance section</li>
                    <li>Find the boy that you wish to update</li>
                    <li>Click the current attendance and select the new attendance</li>
                    <li>Your selection will be updated automatically</li>
                </ol>
            </section>

            
            {(accountType !== "Boy" || appointment) && <>
            <section>
                <h2>Awards Management</h2>

                <h3 id="updating-awards-tracker">Updating awards tracker</h3>
                <ol>
                    <li>Click the &quot;Awards Tracker&quot; button at the top</li>
                    <li>Find the table that you wish to update (Electives, IPA, etc)</li>
                    <li>Find the boy(s) that you wish to update (rows)</li>
                    <li>Find the award that you wish to update (columns)</li>
                    <li>Click the checkbox that corresponds to the selected boy and award</li>
                    <li>Your selection will be updated automatically</li>
                </ol>

                <h3 id="award-requirements">Award Requirements</h3>
                <ol>
                    <li>Click the &quot;Award Requirements&quot; button at the top</li>
                    <li>Find and click the award that you wish to view</li>
                </ol>

                <p>For Awards <strong>with</strong> Masteries</p>
                <ul>
                    <li>You may see multiple masteries</li>
                    <li>A description from the company&apos;s perspective will be displayed per mastery</li>
                    <li>The recommended secondary level for the completion of the mastery is displayed at the top right of every mastery</li>
                    <li>Clicking the book icon (found at the right of the award name if available) would redirect you to the BBSP Notion for that award, where you may learn more about the award</li>
                </ul>

                <p>For Awards <strong>without</strong> Masteries</p>
                <ul>
                    <li>You may only see one description</li>
                    <li>The recommended secondary level for the completion of the award is displayed at the top right of the description</li>
                    <li>Clicking the book icon (found at the right of the award name if available) would redirect you to the BBSP Notion for that award, where you may learn more about the award</li>
                </ul>
            </section>

            <section>
                <h2>Results Generation</h2>

                <h3 id="generate-32a-results">Generating 32A results</h3>
                <div>
                    <HelpPageSteps steps={generate_32a_results_steps} />
                </div>
            </section>
            </>}

            {accountType !== "Boy" && <section>
                <h2>Uniform Inspection</h2>

                <h3 id="viewing-inspection-results">Viewing inspection results</h3>
                <ul>
                    <li>You should be able to see a table of the most recent inspection</li>
                    <li>Click the icon for the boy that you wish to view the inspection</li>
                    <li>You will be redirected to the inspection page for that boy</li>
                    <li>Fields highlighted in green indicate that the boy has fulfilled the listed criteria</li>
                </ul>

                <h3 id="conducting-inspection">Conducting inspection</h3>
                <div>
                    <HelpPageSteps steps={conducting_inspection_steps} />
                </div>
                <p><strong>Only click the &quot;Finish Inspection&quot; button after you have completed the inspection for all boys</strong></p>
                <p>The Boys do not share the same form, you have to swap between the Boys when filling up the form</p>
                <p>You may switch between Boys at any point of the inspection. Swapping to another Boy will not remove the form filled out for the previous Boys.</p>
            </section>}

            {accountType === "Boy" && <section>
                <h2>Boys&apos; Awards</h2>

                <h3 id="viewing-boys-awards">Viewing Boys&apos; Awards</h3>
                <ul>
                    <li>You should be able to see a list of all awards along with their image</li>
                    <li>Each mastery available for that award is also shown</li>
                    <li>For each mastery, a status in a form of an icon will be displayed</li>
                    <li>A red &quot;X&quot; icon indicates that you have not yet achieved the award</li>
                    <li>A green checkmark indicates that you have achieved the award</li>
                    <li>For awards that do not have masteries, a &quot;-&quot; would be displayed in place of a mastery level</li>
                </ul>
            </section>}

            {accountType === "Admin" && <section>
                <h2>Developer</h2>

                <h3 id='developer'>Developer Guide</h3>
                <a href='https://github.com/BryanL2303/BB-21st-Portal/blob/ui/ux-redesign/docs/DeveloperGuide.md'>Click here to see the developer guide</a>
            </section>}
        </div>
    );
}

HelpPageSectionContent.propTypes = {
    accountType: PropTypes.string,
    appointment: PropTypes.string
};

export default HelpPageSectionContent
