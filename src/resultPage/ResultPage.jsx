import React from "react";
import styles from "./resultPage.module.scss";

/* For officers/primers to generate results */
const generatePDF = ({ award, mastery, boys, instructor, description }) => {
	let date = new Date();
	const formattedDate = date.toLocaleDateString('en-GB');

	console.log(instructor)

	return (
		<div id={styles.template}>
			<header>
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
			</header>

			<p className={styles.title} style={{ textAlign: 'center', marginTop: '2%' }}>RESULTS</p>

			<div className={styles.results}>
				<p>BADGE:</p>
				<p>{award?.badge_name || ''} {mastery?.mastery_name || ''}</p>
				<p>DATE:</p>
				<p>{formattedDate}</p>
				<p>DESCRIPTION:</p>
				<p>{description || mastery?.mastery_description || award?.badge_description}</p>
			</div>

			<div className={styles.table}>
				<p>No.</p>
				<p>Name</p>
				<p>Level</p>
				<p>Pass/Fail</p>

				{boys.map((account, index) => (
					<React.Fragment key={account.id}>
						<p>{index + 1}</p>
						<p>{account?.account_name}</p>
						<p>Sec {account?.level}</p>
						<p>Pass</p>
					</React.Fragment>
				))}
			</div>

			<div className={styles.signature}>
				<p>Chief Instructor/Assessor&apos;s Signature</p>
				<p>Name: {instructor?.rank} {instructor?.account_name}</p>
				<p>Credentials: {instructor?.credentials}, BB 21st Singapore Company</p>
			</div>

			<footer>
				<p>Page | 1 of 1</p>
				<p>For 32A Submission | 2022 v1</p>
			</footer>
		</div>
	);
}

export default generatePDF