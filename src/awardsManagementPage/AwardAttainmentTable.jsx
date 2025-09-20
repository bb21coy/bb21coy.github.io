import { useState, useEffect, useMemo, useRef, memo } from 'react'
import PropTypes from 'prop-types'
import { collection, getDocs, query, orderBy } from "@firebase/firestore";
import { db } from "../firebase";
import styles from './awardAttainmentTable.module.scss'

// To show attainment status for each special award
const AwardAttainmentTable = memo(({ award_name, boys, toggleAttainment, attained }) => {
	const [awardsList, setAwardsList] = useState([])
	const scrollRef = useRef(null);
	const fixedRequirements = {
		"personal": [],
		"ipa": ["1 Elective Point"],
		"spa": ["4 Elective Points"],
		"founders": ["6 Elective Points"],
		"service": []
	};

	useEffect(() => {
		const init = async () => {
			const awards = await getDocs(query(collection(db, "awards"), orderBy("badge_name")));
			setAwardsList(awards.docs.map(doc => ({ id: doc.id, ...doc.data() })));
		}

		const handleKeyDown = (e) => {
			if (!scrollRef.current) return;

			const step = 50;
			if (e.key === "ArrowRight") {
				scrollRef.current.scrollLeft += step;
			} else if (e.key === "ArrowLeft") {
				scrollRef.current.scrollLeft -= step;
			}
		};

		init();
		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [award_name])

	const categorisedAwards = useMemo(() => {
		const categories = {}

		awardsList.map(award => {
			const masteries = award.badge_masteries || [];
			if (!categories[award.badge_category]) categories[award.badge_category] = {};

			const masteriesList = masteries.map(m => m.mastery_name);
			categories[award.badge_category][award.badge_name] = masteriesList;
		})

		// override for electives
		if (!categories.personal) categories.personal = {};
		delete categories.personal.Adventure;
		delete categories.personal.Drill;
		categories.personal = {
			Adventure: ["Advanced"],
			Drill: ["Advanced"],
			...categories.personal
		};

		// override for IPA
		if (!categories.ipa) categories.ipa = {};
		categories.ipa = {
			Target: [],
			Adventure: ["Basic"],
			Drill: ["Basic"],
			...categories.ipa,
			"Community Spiritedness": ["Advanced"],
			"Global Awareness": ["Basic"],
			"Leadership": ["Basic"]
		};

		// override for SPA
		if (!categories.spa) categories.spa = {};
		categories.spa = {
			...categories.spa,
			"Total Defence": ["Silver"],
			"Global Awareness": ["Advanced"],
			"Leadership": ["Advanced"],
		};

		// override for founders
		if (!categories.founders) categories.founders = {};
		categories.founders = {
			...categories.founders,
			"Community Spiritedness": ["Master"],
			"Global Awareness": ["Master"],
			"Leadership": ["Master"],
		};

		// override for service
		if (!categories.service) categories.service = {};
		delete categories.service["1 Year Service"];
		categories.service = {
			"1 Year Service (First Year)": [],
			"1 Year Service (Second Year)": [],
			"1 Year Service (Third Year)": [],
			...categories.service,
		};

		return categories
	}, [awardsList])

	const calculatePoints = (awards, boyId) => {
		let points = 0;

		Object.entries(categorisedAwards.personal).forEach(([badge, masteries]) => {
			masteries.forEach(mastery => {
				const id = `${boyId}-${badge}-${mastery}`
				if (attained.includes(id)) {
					points += (mastery === "Advanced") ? 2 : 1;
				};
			});
		});

		return points;
	}

	return (
		<div className={styles["award-attainment-table"]} ref={scrollRef}>
			<table>
				<thead>
					<tr>
						<th rowSpan={2}>Boy</th>

						{fixedRequirements[award_name].map(requirement => (
							<th key={requirement} rowSpan={2}>{requirement}</th>
						))}

						{categorisedAwards[award_name] &&
							Object.entries(categorisedAwards[award_name]).map(([badge, masteries]) => (
								<th key={badge} colSpan={masteries.length} rowSpan={masteries.length > 0 ? 1 : 2}>{badge}</th>
							))}
					</tr>
					<tr>
						{categorisedAwards[award_name] &&
							Object.entries(categorisedAwards[award_name]).flatMap(([badge, masteries]) =>
								masteries.map((mastery) => <th key={`${badge}-${mastery}`}>{mastery}</th>)
							)}
					</tr>
				</thead>
				<tbody>
					{boys.map((boy) => {
						const points = calculatePoints(categorisedAwards.personal, boy.id);
						const rowIds = [
							...fixedRequirements[award_name].map(req => `${boy.id}-${req}`),
							...(categorisedAwards[award_name]
								? Object.entries(categorisedAwards[award_name]).flatMap(([badge, masteries]) =>
									masteries.length > 0
										? masteries.map(m => `${boy.id}-${badge}-${m}`)
										: [`${boy.id}-${badge}`]
								)
								: [])
						];

						const normalIds = rowIds.filter(id => !id.includes("Point"));
						const allNormalChecked = normalIds.every(id => attained.includes(id));

						const requirements = rowIds.filter(id => id.includes("Point"));
						const allPointsChecked = requirements.every(reqId => {
							const parts = reqId.split("-");
							const requirement = parts[parts.length - 1]; // "1 Elective Point"
							const requiredNumber = parseInt(requirement); // 1 or 6
							return points >= requiredNumber;
						});

						const allChecked = rowIds.length > 0 && allNormalChecked && allPointsChecked;

						return <tr key={boy.id}>
							<td style={{ backgroundColor: allChecked && award_name !== "service" && award_name !== "personal" ? "lightgreen" : "white" }}>{boy.account_name}</td>

							{fixedRequirements[award_name].map(requirement => (
								<td key={requirement}>
									<input type='checkbox' id={boy.id + "-" + requirement} onChange={e => !requirement.includes("Point") ? toggleAttainment(e) : null} disabled={requirement.includes("Point")} checked={!requirement.includes("Point") ? attained.includes(boy.id + "-" + requirement) : points >= parseInt(requirement.split(" ")[0])} />
								</td>
							))}

							{categorisedAwards[award_name] &&
								Object.entries(categorisedAwards[award_name]).flatMap(([badge, masteries]) =>
									masteries.length > 0
										? masteries.map((mastery) => (
											<td key={`${badge}-${mastery}`}>
												<input type='checkbox' id={boy.id + "-" + badge + '-' + mastery} onChange={e => toggleAttainment(e)} checked={attained.includes(boy.id + "-" + badge + '-' + mastery)} />
											</td>
										)) : (
											<td key={`${badge}`}>
												<input type='checkbox' id={boy.id + "-" + badge} onChange={e => toggleAttainment(e)} checked={attained.includes(boy.id + "-" + badge)} />
											</td>
										)
								)}
						</tr>
					})}
				</tbody>
			</table>
		</div>
	)
})

AwardAttainmentTable.propTypes = {
	award_name: PropTypes.string,
	boys: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		account_name: PropTypes.string,
		level: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
	})),
	toggleAttainment: PropTypes.func.isRequired,
	attained: PropTypes.arrayOf(PropTypes.string)
}

export { AwardAttainmentTable }