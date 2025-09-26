import { useEffect, useState } from 'react'
import { db } from '../firebase'
import { getDocs, where, query, collection, orderBy, limit } from '@firebase/firestore'
import ParadeNoticePDF from './ParadeNoticePDF'
import styles from './paradeNoticePage.module.scss'

const ParadeNoticePage = () => {
    const [nearestParade, setnearestParade] = useState(null)

    useEffect(() => {
        const fetchParades = async () => {
            const paradesAfterToday = query(collection(db, 'parades'), where('date', '>=', new Date()), orderBy('date', 'asc'), limit(1))
            const snapshot = await getDocs(paradesAfterToday)
            const parades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            if (parades.length > 0) setnearestParade(parades[0])
        }

        fetchParades()
    }, [])

    return (
        <div className={styles["parade-notice-page"]}>
            {nearestParade ?
                <ParadeNoticePDF parade={nearestParade} /> : 
                <div>
                    <p>The Parade Notice has not been released</p>
                </div>
            }
        </div>
    )

}

export default ParadeNoticePage