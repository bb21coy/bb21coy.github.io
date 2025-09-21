import { useState, useEffect, useMemo, Fragment } from 'react'
import styles from './userAwardsPage.module.scss'
import Loading from '../general/Loading'
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { db } from '../firebase'
import { collection, getDocs, query, orderBy } from '@firebase/firestore'

const UserAwards = () => {
    const auth = getAuth()
    const [awards, setAwards] = useState([])
    const [attained, setAttained] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const awards = await getDocs(query(collection(db, "awards"), orderBy("badge_name")));
                const awardList = awards.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAwards(awardList);

                const attained = await getDocs(collection(db, "attainments"));
                const docIds = attained.docs.map((doc) => doc.id);
                const userAwards = docIds.filter(id => id.includes(user.uid));
                const normalisedUserAwards = userAwards.map(id => id.slice(id.indexOf("-") + 1));
                setAttained(normalisedUserAwards);

                setLoading(false)
            }
        })

        return () => unsub();
    }, [])

    useEffect(() => {
        const documents = document.querySelectorAll(".award");
        documents.forEach(doc => {
            if (doc.innerText.toLowerCase().includes(search.toLowerCase())) {
                doc.style.display = "flex";
            } else {
                doc.style.display = "none";
            }   
        })   
    }, [search])

    const order = useMemo(() => {
        const specialAwards = ["Intermediary Proficiency Award", "Senior Proficiency Award", "Founder's Award"]
        const sortedList = [
            "1 year service (first year)",
            "1 year service (second year)",
            "1 year service (third year)",
            "target",
            "3 year service",
            "leadership",
            "national event",
        ]
        const awardNames = awards.map(award => award.badge_name).filter(name => !specialAwards.includes(name) && name !== "1 Year Service" && name !== "3 Year Service")
        const targetIndex = sortedList.indexOf("target");
        sortedList.splice(targetIndex + 1, 0, ...awardNames);
        const finalList = [...sortedList, ...specialAwards.reverse()];
        return finalList
    }, [awards])

    if (loading) return <Loading />

    return (
        <div className={styles['user-awards']}>
            <h2>My Awards</h2>

            <div>
                <label htmlFor="search"><i className="fa-solid fa-magnifying-glass"></i></label>
                <input type="search" name="search" id="search" placeholder='Search' value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className={styles['awards-list']}>
                {order.map(o => {
                    const award = awards.find(award => award.badge_name.toLowerCase().trim() === o.toLowerCase().split("(")[0].trim())
                    const awardName = o.replace(/(^|[^a-zA-Z'])[a-z]/g, char => char.toUpperCase())

                    return <div key={o} className={styles.award}>
                        <img src={`${award.badge_name.toLowerCase().replaceAll(" ", "-").replace("-badge", "")}-badge.webp`} onError={(e) => { e.currentTarget.src = "1-year-service-badge.webp"; }} alt={o} />

                        <div>
                            <h3>{awardName}</h3>
                            {(award.badge_masteries.length > 0 ? award.badge_masteries : [{ mastery_name: "-" }]).map(mastery => (
                                <Fragment key={`${award.badge_name}-${mastery.mastery_name}`}>
                                    <p>{mastery.mastery_name}</p>
                                    <i className={attained.includes(`${awardName}${mastery.mastery_name === "-" ? "" : `-${mastery.mastery_name}`}`) ? `fa-solid fa-check ${styles["fa-check"]}` : `fa-solid fa-xmark ${styles["fa-xmark"]}`}></i>
                                </Fragment>
                            ))}
                        </div>
                    </div>
                })}
            </div>
        </div>
    )
}

export default UserAwards