import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { AwardAttainmentTable } from './AwardAttainmentTable'
import UploadFile from './UploadFile';
import styles from './awardTracker.module.scss'
import AwardFilter from './AwardFilter';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, deleteDoc, setDoc } from '@firebase/firestore'
import { db } from '../firebase'

// To show boys progression towards IPA/SPA/Founders
const AwardTracker = () => {
	const [boys, setBoys] = useState([])
	const [attained, setAttained] = useState([])
	const [awards, setAwards] = useState([])
	const [category, setCategory] = useState("upload");

	useEffect(() => {
		const init = async () => {
			const boys = await getDocs(query(collection(db, "users"), where("account_type", "==", "Boy"), where("graduated", "==", false), orderBy("level"), orderBy("account_name")));
			setBoys(boys.docs.map(doc => ({ id: doc.id, ...doc.data() })));

			const awards = await getDocs(collection(db, "awards"));
			setAwards(awards.docs.map(doc => ({ id: doc.id, ...doc.data() })));
		}

		const unsubscribe = onSnapshot(collection(db, "attainments"), (snapshot) => {
			const docIds = snapshot.docs.map((doc) => doc.id);
			setAttained(docIds);
		});

		init()
		return () => unsubscribe();
	}, [])

	async function toggleAttainment(e) {
		try {
			if (e.target.checked == true) {
				await setDoc(doc(db, "attainments", e.target.id), {});
			} else {
				await deleteDoc(doc(db, "attainments", e.target.id));
			}
		} catch (err) {
			console.error(err);
			showMessage("Failed to toggle attainment");
		}
	}

	return (
		<div className={styles['award-tracker']}>
			<div className={styles.sidebar}>
				<input type="radio" name="category" id="upload1" defaultChecked={category == 'upload'} onChange={() => setCategory('upload')} />
				<label htmlFor="upload1">Upload Awards Tracker</label>
				<input type="radio" name="category" id="personal" defaultChecked={category == 'personal'} onChange={() => setCategory('personal')} className="personal" />
				<label htmlFor="personal">Personal Mastery</label>
				<input type="radio" name="category" id="ipa" defaultChecked={category == 'ipa'} onChange={() => setCategory('ipa')} />
				<label htmlFor="ipa">IPA</label>
				<input type="radio" name="category" id="spa" defaultChecked={category == 'spa'} onChange={() => setCategory('spa')} className="spa" />
				<label htmlFor="spa">SPA</label>
				<input type="radio" name="category" id="founders" defaultChecked={category == 'founders'} onChange={() => setCategory('founders')} />
				<label htmlFor="founders">Founders</label>
				<input type="radio" name="category" id="service" defaultChecked={category == 'service'} onChange={() => setCategory('service')} />
				<label htmlFor="service">Service</label>
			</div>

			{category == 'upload' ? <UploadFile attained={attained} boys={boys} /> : (
				<div className={styles.content}>
					<AwardFilter />
					<AwardAttainmentTable award_name={category} boys={boys} toggleAttainment={toggleAttainment} attained={attained} />
				</div>
			)}
		</div>
	)
}

AwardTracker.propTypes = {
	award_name: PropTypes.string
}

export { AwardTracker }