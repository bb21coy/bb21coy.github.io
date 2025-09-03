import { useState, useEffect } from 'react'
import axios from 'axios'
import { handleServerError } from '../general/handleServerError'
import BASE_URL from '../Constants'
import '../styles/userAwardsPage.scss'
import Loading from '../general/Loading'

const UserAwards = () => {
    const [awards, setAwards] = useState([])
    const [attained, setAttained] = useState([])
    const [loading, setLoading] = useState(true)

    const images = {
        'target': 'target-badge.webp',
        'total defence': 'total-defence-bronze-badge.webp',
        'arts & crafts': 'arts-&-crafts-badge.webp',
        'community spiritedness': 'community-spiritedness-badge.webp',
        'global awareness': 'global-awareness-badge.webp',
        'leadership': 'leadership-badge.webp',
        'adventure': 'adventure-badge.webp',
        'drill': 'drill-badge.webp',
        'athletics': 'athletics-badge.webp',
        'first aid': 'first-aid-badge.webp',
        'hobbies': 'hobbies-badge.webp',
        'kayaking': 'kayaking-badge.webp',
        'musketry': 'musketry-badge.webp',
        'sailing': 'sailing-badge.webp',
        'sportsman': 'sportsman-badge.webp',
        'swimming': 'swimming-badge.webp',
        'christian education': 'christian-education-badge.webp',
        'senior proficiency award': 'senior-proficiency-award-badge.webp',
        'intermediary proficiency award': 'intermediary-proficiency-award-badge.webp',
        'link badge': 'link-badge.webp',
        '3 year service': '3-year-service-badge.webp',
        'national event': 'national-event-badge.webp',
        'founders': 'founders-badge.webp',
        '1 year service': '1-year-service-badge.webp',
    }
    
    useEffect(() => {
        axios.get('/api/award_tracker/0/user_awards')
        .then(response => setAttained(response.data.map(award => `${award.award_id}-${award.mastery_id}`)))
        .catch(error => handleServerError(error.response?.status))

        axios.get(`${BASE_URL}/awards`, { headers: { "x-route": "/get_awards" }, withCredentials: true })
        .then(response => setAwards(response.data))
        .catch(error => handleServerError(error.response?.status))

        setLoading(false)
    }, [])

    if (loading) return <Loading />

    return (
        <div className='user-awards'>
            <h2>My Awards</h2>

            <div className='awards-list'>
                {awards.map(award => {
                    return <div key={award._id} className='award'>
                        <img src={images[award.badge_name.toLowerCase()]} alt={award.badge_name} />

                        <div>
                            <h3>{award.badge_name}</h3>
                            {award.badge_masteries.length > 0 ? award.badge_masteries.map(mastery => (
                                <div key={mastery._id}>
                                    <p>{mastery.mastery_name}</p>
                                    <i className={attained.includes(`${award._id}-${mastery._id}`) ? 'fa-solid fa-check' : 'fa-solid fa-xmark'}></i>
                                </div>
                            )) : 
                            <div>
                                <p>&ndash;</p>
                                <i className={attained.includes(`${award._id}-null`) ? 'fa-solid fa-check' : 'fa-solid fa-xmark'}></i>   
                            </div>}
                        </div>
                    </div>
                })}
            </div>
        </div> 
    )
}

export default UserAwards