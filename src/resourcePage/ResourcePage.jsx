import { useEffect, useState } from 'react'
import { onSnapshot, doc, updateDoc, collection, getDoc } from '@firebase/firestore';
import { db } from '../firebase';
import Loading from '../general/Loading';
import { useUser } from '../general/UserContext';
import styles from './resourcePage.module.scss'

const ResourcePage = () => {
    const rankCount = [1, 2, 3, 4, 4];
    const rankNames = ["Lance Corporal (LCP)", "Corporal (CPL)", "Sergeant (SGT)", "Staff Sergeant (SSG)", "Warrant Officer (WO)"];
    const [appointments, setAppointments] = useState({});
    const [blocked, setBlocked] = useState();
    const [loading, setLoading] = useState(true);
    const [selectedResource, setSelectedResource] = useState('target');
    const { user } = useUser();

    useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, "appointments"), async (querySnapshot) => {
			if (querySnapshot.empty) return;
			const firstDoc = querySnapshot.docs[0];
			const data = firstDoc.data();
			const appts = {};

			for (const [key, ref] of Object.entries(data)) {
				const refSnap = await getDoc(ref);
				if (refSnap.exists()) {
					appts[key] = { id: refSnap.id, ...refSnap.data() };
				}
			}

			setAppointments(appts);
		});

        onSnapshot(doc(db, 'others', '0FQD3gm0fBfSVm38yErz'), (doc) => {
            setBlocked(doc.data());
            setLoading(false);
        })

        return () => unsubscribe();
    }, [])

    const changeBlock = (resource) => {
        updateDoc(doc(db, 'others', '0FQD3gm0fBfSVm38yErz'), { [`block_${resource}`]: !blocked[`block_${resource}`] });
    }

    const scrollToSection = (e, id) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (loading) return <Loading />

    return (
        <div className={styles["resource-page"]}>
            <div className={styles.sidebar}>
                <div>
                    <input type="radio" name="selector" id="target" checked={selectedResource === 'target'} onChange={() => setSelectedResource('target')} />
                    <label htmlFor="target">Target</label>
                </div>
            </div>

            <div className={styles.content}>
                {user.account_type !== 'Boy' && <div className={styles['block-panel']}>
                    <label htmlFor="block_target">Block Target</label>
                    <input type="checkbox" name="block_target" id="block_target" checked={blocked?.block_target} onChange={() => changeBlock("target")} />
                </div>}

                {(((!blocked || !blocked.block_target) && selectedResource === 'target') || user.account_type !== 'Boy') && <>
                    <h2>Overview</h2>

                    <div className={styles.overview}>
                        <a onClick={(e) => scrollToSection(e, 'bb-history')}>BB History</a>
                        <a onClick={(e) => scrollToSection(e, 'bb-singapore-story')}>The BB Singapore Story</a>
                        <a onClick={(e) => scrollToSection(e, 'bb-international')}>Overview of BB International and BB Asia</a>
                        <a onClick={(e) => scrollToSection(e, 'bb-vesper')}>BB Vesper</a>
                        <a onClick={(e) => scrollToSection(e, 'table-grace')}>Table Grace</a>
                        <a onClick={(e) => scrollToSection(e, 'bb-songs')}>BB Songs</a>
                        <a onClick={(e) => scrollToSection(e, 'bb-object')}>BB Object, Motto and Logo</a>
                        <a onClick={(e) => scrollToSection(e, 'uniform')}>Uniform</a>
                        <a onClick={(e) => scrollToSection(e, 'award-scheme')}>Award Scheme</a>
                        <a onClick={(e) => scrollToSection(e, 'company-organisation')}>Company Organisation and Ranks</a>
                        <a onClick={(e) => scrollToSection(e, 'company-history')}>Company Life and History</a>
                    </div>

                    <h3 id="bb-history">BB History</h3>
                    <ul>
                        <li>Sir William Alexander Smith was a volunteer Officer as well as a Sunday school teacher</li>
                        <li>He realized the difficulty of maintaining order in a crowd of unruly Boys and keeping them in the church after Sunday school</li>
                        <li>To solve the problem, he devised a unique system of starting an organization for Boys as part of the church, based on the twin pillars of religion and discipline</li>
                        <li>This led to the founding of The Boys’ Brigade</li>
                    </ul>

                    <h3 id="bb-singapore-story">The BB Singapore Story</h3>
                    <article>
                        To understand the history of the BB in Singapore, we have to begin by looking at two cities: Aberdeen and Swatow.
                        <br /><br />
                        BB was established in both of these cities, with Aberdeen being one of the earliest cities to adopt The Boys’ Brigade. The 1st Swatow Company in China was also a mammoth company 300 strong which saw many of its members flee to Nanyang due to the communist regime. So, what does this have to do with the BB in Singapore?
                        <br /><br />
                        The link lies in these two individuals. One was James Milner Fraser, who was a member of the 23rd Aberdeen Company and an Officer in the 23rd London Company. He came to Singapore as a young architect, and was a town planner by profession. He was recognized by his BB buttonhole badge by Sergeant Quek Eng Moh, a Swatow Old Boy, who then told Fraser that the ex-Swatow stalwarts wanted to start a Boys’ Brigade Company in Singapore.
                        <br /><br />
                        This led to the founding of the 1st Singapore Company at Prinsep Street Presbyterian Church on 12th January 1930. When the Company was officially enrolled in August 1930 by Brigade Headquarters in London, the membership stood at 40. By 1936, the Singapore Battalion was 200 strong. However, BB activities were suspended during World War 2, which was a trying time for the Boys Brigade as some Officers and Boys lost their lives under the Japanese Occupation. Fraser himself was a prisoner of war and worked on construction of the infamous Burma railway.
                        <br /><br />
                        After the war, S P Chua – captain of the 1st Singapore Company – revived the Company the was joined immediately by Fraser. The Singapore Battalion continued to grow and the Brigade was also honoured to have the President of the Republic of Singapore as its Patron in 1971.
                    </article>

                    <h3 id="bb-international">Overview of BB International and BB Asia</h3>
                    <ul>
                        <li>Today, the BB in Singapore celebrates over 90 years in Singapore, with about 6,000 members and 1,000 Officers in Singapore</li>
                        <li>Internationally, the BB is present in around 60 countries, with 700,000 members worldwide. The BB can be found in all Commonwealth countries, and in many Asian countries such as Singapore, Thailand and Hong Kong. The life of Companies everywhere follows some basic principles, with variations in uniform and activities to suit local conditions and culture</li>
                    </ul>

                    <h4>BB Day</h4>
                    <p>BB members go to school in BB uniform on 12 January, which commemorates our founding in Singapore.</p>

                    <h4>BB Handshake</h4>
                    <p>A unique hand shake shared by BB members worldwide</p>
                    <img src="handshake.png" alt="BB Handshake" className={styles['custom-image-250']} />

                    <h3 id="bb-vesper">BB Vesper</h3>
                    <p className={styles.center}>
                        Great God Who knowest all our need,<br />
                        Bless Thou our watch, and guard our sleep;<br />
                        Forgive our sins of thought and deed,<br />
                        And in Thy peace Thy servants keep.<br />
                        <br />
                        We thank Thee for the day that’s done,<br />
                        We trust Thee for the days to be;<br />
                        Thy love we learn in Christ Thy Son,<br />
                        O May we all His glory see!<br />
                    </p>

                    <h3 id="table-grace">Table Grace</h3>
                    <p className={styles.center}>
                        Be present at our table Lord<br />
                        Be here and everywhere adored<br />
                        These mercies bless and grant that we<br />
                        May feast in fellowship with Thee<br />
                    </p>

                    <h3 id="bb-songs">BB Songs</h3>
                    <h4>Mighty Band of Brothers</h4>
                    <iframe src="https://www.youtube-nocookie.com/embed/gjl4fzQK89Q" frameBorder={"0"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>

                    <h4>The Anchor Song</h4>
                    <iframe src="https://www.youtube-nocookie.com/embed/UQQO8v-0VBo" frameBorder={"0"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>

                    <h3 id="bb-object">BB Object, Motto and Logo</h3>
                    <h4>BB Object</h4>
                    <p>The advancement of Christ's Kingdom among Boys, and the promotion of habits of Obedience, Reverence, Discipline, Self-respect and all that tends towards a true Christian Manliness.</p>

                    <h4>BB Motto</h4>
                    <p>Sure and Stedfast</p>
                    <p>"which hope we have as an anchor of the soul, both Sure and Stedfast" - <i>Hebrews 6:19</i></p>

                    <h4>BB Logo</h4>
                    <img src='bb-logo.jpg' alt="BB Logo" className={styles['custom-image-150']} />

                    <h3 id="uniform">Uniform</h3>
                    <img src="uniforms.png" alt="Uniform" />

                    <table>
                        <thead>
                            <tr>
                                <th>Metal Parts</th>
                                <th>Fabric Material</th>
                                <th>Leather Parts</th>
                                <th>Personal Grooming</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Cap badge, badges, haversack loop, slide, button hole and belt buckle should be shiny and free from rust, stains and mould</td>
                                <td>Frayed thread should be trimmed.<br /><br />All fabric should be kept clean and free from stains (e.g. field service cap, uniform).<br /><br />Uniform shirt and pants should be ironed and free from creases</td>
                                <td>Shoes are to be kept clean and black via the use of shoe shine.<br /><br />Belt and crossbelt can be lightly oiled with mink oil</td>
                                <td>Haircut should be neat, should not cover ears and eyebrows, should be above the collar at the back.<br /><br />No artificial colouration of hair is allowed.<br /><br />Fingernails should be kept short and clean.<br /><br />Body ornaments should not be worn. </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className={styles.badges}>
                        <img src="badges.png" alt="Justin's Badges" className={styles['custom-image-250']} />
                        <p>Wear badges correctly and in the right order. Place proficiency badges in alphabetical order, with no more than five per row. Put the target badge first in the top line of proficiency badges.</p>
                    </div>

                    <h3 id="award-scheme">Award Scheme</h3>
                    <p>Each badgework has three levels – Basic, Advanced, and Master, and they are categorized within 4 domains which highlight the desired qualities a Seniors Programme Boy should attain through their BB Journey</p>
                    <h4>Personal Mastery</h4>
                    <ul>
                        <li>Core: Adventure and Drill</li>
                        <li>Modular: Choose from different electives</li>
                        <li>Point system:</li>
                        <ul className={styles.indent}>
                            <li>Basic: 1 point</li>
                            <li>Advanced: 2 points</li>
                            <li>Master: 3 points</li>
                        </ul>
                    </ul>
                    <div className={styles['badge-list']}>
                        {['target', 'drummer', 'arts-&-crafts', 'athletics', 'bandsman', 'bugler', 'adventure', 'first-aid', 'gym', 'hobbies', 'kayaking', 'drill', 'piper', 'musketry', 'sailing', 'sportsman', 'swimming'].map((badge, index) => (
                            <div key={index}>
                                <img key={index} src={`${badge}-badge.webp`} alt={badge} className='custom-image-100' />
                                <p>{badge.replaceAll('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                            </div>
                        ))}
                    </div>

                    <h4>Leadership</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="leadership-badge.webp" alt="Leadership Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <p>Basic: 6 lessons of Leadership Development Course</p>
                            <p>Advanced: 12 lessons of Leadership Development Course</p>
                            <p>Master: National Leadership Camp</p>
                        </div>
                    </div>

                    <h4>Community Spiritedness</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="community-spiritedness-badge.webp" alt="Community Spiritedness Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <p>Basic: 1 stakeholder event, 15 hours of CS</p>
                            <p>Advanced: 2 stakeholder events, 30 hours of CS</p>
                            <p>Master: 3 stakeholder events, 30 hours of CS, master level project</p>
                            <br />
                            <p>Eg: BB Cares, BB Share a Gift</p>
                        </div>
                    </div>

                    <h4>Global Awareness</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="global-awareness-badge.webp" alt="Global Awareness Badge" />
                        <div>
                            <p>Basic: Choose 3 out of 13 focuses</p>
                            <p>Advanced: 3 key stone modules, Research in-depth into 1 of 3 focuses</p>
                            <p>Master: Project with action plans to solve problems of chosen topic; Rubrics-based assessment which includes presentation</p>
                        </div>
                    </div>

                    <h4>Intermediary Proficiency Award (IPA)</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="intermediary-proficiency-award-badge.webp" alt="Intermediary Proficiency Award Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <ul>
                                <li>Basic Drill</li>
                                <li>Basic Adventure</li>
                                <li>1 Elective Point</li>
                                <li>2 Stakeholder Events</li>
                                <li>30 hours of Community Service</li>
                                <li>6 lessons of Leadership Development</li>
                                <li>3 out of 13 focuses in Global Awareness</li>
                            </ul>
                        </div>
                    </div>

                    <h4>Senior Proficiency Award (SPA)</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="senior-proficiency-award-badge.webp" alt="Senior Proficiency Award Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <ul>
                                <li>Intermediary Proficiency Award (IPA)</li>
                                <li>Basic Drill</li>
                                <li>Basic Adventure</li>
                                <li>Total Defence Silver</li>
                                <li>Christian Education Award</li>
                                <li>4 Elective Points</li>
                                <li>2 Stakeholder Events</li>
                                <li>30 hours of Community Service</li>
                                <li>12 lessons of Leadership Development</li>
                                <li>3 key stone modules in Global Awareness</li>
                                <li>Research and present findings in Global Awareness</li>
                            </ul>
                        </div>
                    </div>

                    <h4>Founder's Award</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="public/founder's-award-(only-ssgs-and-wos-can-apply)-badge.webp" alt="Founder's Award Badge" />
                        <div>
                            <p>Criteria:</p>
                            <ul>
                                <li>Senior Proficiency Award (SPA)</li>
                                <li>Basic Drill</li>
                                <li>Basic Adventure</li>
                                <li>Total Defence Silver</li>
                                <li>Christian Education Award</li>
                                <li>6 Elective Points</li>
                                <li>3 Stakeholder Events</li>
                                <li>30 hours of Community Service</li>
                                <li>Master Level Project in Community Spiritedness</li>
                                <li>National Leadership Camp</li>
                                <li>Social Entrepreneurship project in Global Awareness</li>
                            </ul>
                        </div>
                    </div>

                    <h4>Link Badge</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="link-badge.webp" alt="Link Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <p>Awarded to Boys who were members in the Juniors Programme and have completed the requirements for the award during their last session in the Juniors Programme.</p>
                        </div>
                    </div>

                    <h4>One Year Service</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="1-year-service-(first-year)-badge.webp" alt="One Year Service Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <p>Awarded to Boys who have served with good conduct and have attended a minimum of 25 parades</p>
                        </div>
                    </div>

                    <h4>Three Years Service</h4>
                    <div className={styles['badge-explanation']}>
                        <img src="3-year-service-badge.webp" alt="Three Years Service Badge" />
                        <div>
                            <p>Attainment Criteria:</p>
                            <p>Awarded to Boys who have served with good conduct and have attended a minimum of 25 parades each year for 3 years</p>
                        </div>
                    </div>

                    <h3 id="company-organisation">Company Organisation and Ranks</h3>
                    <h4>Non-Commissioned Officer (NCO)</h4>
                    <p>It is a great honour for a Boy to be promoted to the rank of a NCO<br /><br />A NCO should at all time set an example of enthusiasm and right living to other Boys such as through regular attendance, punctuality and orderliness</p>
                    <p>Roles of an NCO:</p>
                    <ul>
                        <li>To assist Officers with the running of company activities</li>
                        <li>Manage a squad of Boys</li>
                        <li>Teach and lead younger Boys</li>
                        <li>Be a role model for younger Boys</li>
                        <li>Improve communication between Officers and younger Boys</li>
                        <li>Look out for the welfare of Boys</li>
                    </ul>

                    <h4>Squads</h4>
                    <p>Boys in a Company are divided into squads, the basic units of a BB Company.</p>
                    <p>Each squad has an appointed Squad Leader, who puts welfare of the Squad members before his own, always leading by example in his service and conduct.</p>
                    <ul>
                        <li>Help Officers in running and organizing the Company</li>
                        <li>Look into the welfare, attendance, conduct and smartness of his squad members</li>
                        <li>Pass along information to squad members and channel feedback from the Boys to the Officers</li>
                        <li>Coach and guide his squad members</li>
                        <li>Build up teamwork and friendship among squad members</li>
                        <li>Follow up on absentees to find out how they are doing and encourage them to return</li>
                    </ul>

                    <h4>Squad Members</h4>
                    <p>Roles of a Squad Member:</p>
                    <ul>
                        <li>Be supportive of the Squad Leader</li>
                        <li>Be punctual for squad and BB activities</li>
                        <li>Support and participate in squad activities</li>
                        <li>Contribute your time, talents and ideas to your squad</li>
                        <li>Have an attitude of serving and helping other squad members</li>
                        <li>If you know of a squad member who is facing a problem that neither he nor you can solve, share this with your Officer</li>
                    </ul>

                    <h4>Ranks for Boys</h4>
                    <div className={styles['ranks-list']}>
                        <div className={styles['rank-item']}>Recuit (REC)</div>
                        <div className={styles['rank-item']}>Private (PTE)</div>
                        {rankCount.map((rank, index) => (
                            <div key={index} className={styles['rank-item']}>
                                <div className={styles.rank}>
                                    {Array.from({ length: rank }).map((_, i) => (
                                        <img key={i} src="rank-stripe.png" alt={`Rank ${index + 1}`} />
                                    ))}
                                </div>
                                <p>{rankNames[index]}</p>
                            </div>
                        ))}
                    </div>

                    <h4>Promotion</h4>
                    <p>Promotion is affected by attendance, participation, leadership and attitude of a Boy</p>
                    <div className={styles['promotion-container']}>
                        <div className={styles['promotion-list']}>
                            {["Recuit (REC)", "Private (PTE)"].map((rank, index) => (
                                <div className={styles['promotion-item']} key={index}>
                                    <span></span>
                                    <p>{rank}</p>
                                </div>
                            ))}
                            {rankNames.map((rank, index) => (
                                <div className={styles['promotion-item']} key={index}>
                                    <span></span>
                                    <p>{rank}</p>
                                </div>
                            ))}
                        </div>

                        {Array.from({ length: 4 }).map((_, index) => (
                            <div className={styles[`sec${index + 1}-promotion`]} key={index}></div>
                        ))}

                        <div className='sec1-promotion'></div>
                        <div className='sec2-promotion'></div>
                        <div className='sec3-promotion'></div>
                        <div className='sec4-promotion'></div>
                    </div>

                    <h4>Concept of Company</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Sponsoring Body</th>
                                <th>Officers' Council</th>
                                <th>NCO Council</th>
                                <th>Squad System</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <ul>
                                        <li>School</li>
                                        <li>Church</li>
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        <li>BB Officers</li>
                                        <li>BB Teachers in Charge</li>
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        <li>Company Sergeant Major (CSM)</li>
                                        <li>Boys - NCO</li>
                                    </ul>
                                </td>
                                <td>
                                    <ul>
                                        <li>Squad Leaders</li>
                                        <li>All Boys</li>
                                    </ul>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 id="company-history">Company Life and History</h3>
                    <h4>History</h4>
                    <p>We are the 21<sup>st</sup> Singapore Company</p>
                    <p>The 21<sup>st</sup> Company started in 1984</p>
                    <p>Sponsoring School: Geylang Methodist School (Secondary)</p>
                    <p>Sponsoring Church: Christalite Methodist Chapel</p>

                    <h3>Company Appointments</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Appointment</th>
                                <th>Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(appointments).map(([appointment, account], index) => (
                                <tr key={index}>
                                    <td>{appointment}</td>
                                    <td>{account.account_name}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </>}

                {blocked.block_target && selectedResource === 'target' && user.account_type === 'Boy' && <div className={styles['resource-page-blocked']}>
                    <img src="not-found.webp" alt="Not Found" />
                    <p>This resource is blocked. Please try again later.</p>
                </div>}
            </div>
        </div>
    )
}

export default ResourcePage