import React, { useState, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import '../styles/resultGenerationPDF.scss'

/* For officers/primers to generate results */
const generatePDF = ({ award, mastery, boys, instructor, description, setPdfUrl, setIsLoading }) => {
	let date = new Date();
	const formattedDate = date.toLocaleDateString('en-GB');
	const pdfContentRef = useRef(null);
	const originalConsoleDebug = console.debug;
	console.debug = () => {};

	useEffect(() => {
		generatePDF();
	}, [award, mastery, boys, instructor, description]);

	const generatePDF = () => {
		setIsLoading(true);
		const doc = new jsPDF("p", "mm", "a4");
		console.debug = originalConsoleDebug;

		const contentHeight = 297; // A4 Height
		const contentWidth = 210;  // A4 Width

		// Get the content dimensions from the element reference
		const contentElementWidth = pdfContentRef.current.offsetWidth;
		const contentElementHeight = pdfContentRef.current.offsetHeight;

		// Calculate scale factor to fit content inside A4 dimensions
		const scaleFactor = contentWidth / contentElementWidth;
		const scaledHeight = contentElementHeight * scaleFactor;

		// Adjust for page height scaling
		const scaleHeightFactor = contentHeight / scaledHeight;
		const finalScaleFactor = Math.min(scaleFactor, scaleHeightFactor);

		// Calculate the final width and height after scaling
		const finalWidth = contentWidth;
		const finalHeight = scaledHeight * finalScaleFactor;

		const image = new Image();
    	image.src = "bb-crest.png";

		image.onload = () => {
			// Add image to the PDF before rendering HTML content
			doc.addImage(image, 'PNG', 10, 5, 50 * 0.26458, 50 * 0.26458); // Convert 50px to mm

			// Render the HTML content inside the PDF
			doc.html(pdfContentRef.current, {
				callback: function (doc) {
					const pdfBlob = doc.output("blob");
					const pdfUrl = URL.createObjectURL(pdfBlob);
					setPdfUrl(pdfUrl);
					setIsLoading(false);
				},
				margin: [0, 0, 0, 0],
				x: 0,
				y: 0,
				windowWidth: 792,
				width: finalWidth,
				height: finalHeight,
				autoPaging: true,
			});
		};

		// Handle error loading image
		image.onerror = () => {
			setIsLoading(false);
			console.error('Image loading failed');
		};
	};

	return (
		<div ref={pdfContentRef}>
			<div id="pdf-template">
				<div className="header">
					<img src="bb-crest.png" alt="Logo" style={{ width: "50px", height: "50px" }} />
					<div>
						<p><b>THE BOYS' BRIGADE</b></p>
						<p><b>21st SINGAPORE COMPANY</b></p>
						<p>GEYLANG METHODIST SCHOOL (SECONDARY)</p>
					</div>
					<div className="verse">
						<p>This hope we have as an anchor of the soul, a hope both</p>
						<p><strong>sure and stedfast</strong> and one which enters within the veil</p>
						<p>where Jesus has entered as a forerunner for us...</p>
						<p>Hebrews 6:19-20a</p>
					</div>
				</div>

				<p className="title" style={{ textAlign: 'center', marginTop: '2%' }}>RESULTS</p>

				<div className="results">
					<p>BADGE:</p>
					<p>{award?.badge_name || ''} {mastery?.mastery_name || ''}</p>
					<p>DATE:</p>
					<p>{formattedDate}</p>
					<p>DESCRIPTION:</p>
					<p>{description || mastery?.mastery_description || award?.badge_description}</p>
				</div>

				<div className="table">
					<p>No.</p>
					<p>Name</p>
					<p>Level</p>
					<p>Pass/Fail</p>

					{boys.map((account, index) => (
						<React.Fragment key={account._id}>
							<p>{index + 1}</p>
							<p>{account?.account_name}</p>
							<p>Sec {account?.level}</p>
							<p>Pass</p>
						</React.Fragment>
					))}
				</div>

				<div className="signature">
					<p>Chief Instructor/Assessor&apos;s Signature</p>
					<p>Name: {instructor?.rank} {instructor?.account_name}</p>
					<p>Credentials: {instructor?.credentials}, BB 21st Singapore Company</p>
				</div>

				<footer>
					<p>Page | 1 of 1</p>
					<p>For 32A Submission | 2022 v1</p>
				</footer>
			</div>
		</div>
	);
}

export default generatePDF