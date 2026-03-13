import styles from "./footer.module.scss"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useUser } from "./UserContext"

const Footer = () => {
    const { user } = useUser()
    const navigate = useNavigate()

    useEffect(() => {
		if (!window.googleTranslateElementInit) {
			window.googleTranslateElementInit = () => {
				new window.google.translate.TranslateElement(
					{
						pageLanguage: "en",
						includedLanguages: "en,zh-CN,ms,ta",
						autoDisplay: false,
					},
					"google_translate_element"
				)
			}

			const script = document.createElement("script")
			script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
			document.body.appendChild(script);

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "en,zh-CN,ms,ta",
                        autoDisplay: false,
                    },
                    "google_translate_element"
                )
            }
		}
	}, [])

    return (
        <footer>
            <div className={styles.top}>
                <div className={styles.about}>
                    <div className={styles.logo}>
                        <img src="/bb-crest.png" alt='BB Logo' width={"60px"} height={"60px"} />
                        <div>
                            <p>The boys' brigade</p>
                            <span>21st Singapore Company</span>
                        </div>
                    </div>
                    <p>BB 21st Portal streamlines repetitive tasks like parade notices, attendance, awards tracking, uniform inspections, and 32A result generation.</p>
                    <a href="https://www.instagram.com/bb21coy/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
                </div>

                <div className={styles.links}>
                    <p>Quick Links</p>
                    {user.t ? <p onClick={() => navigate('/home')}>Dashboard</p> : <p onClick={() => navigate('/login')}>Login</p>}
                    <p onClick={() => navigate('/parade_notice')}>Parade Notice</p>
                    <p onClick={() => window.open("https://portal.bb21coy.workers.dev/calendar", "_blank")}>Calendar</p>
                </div>

                <div className={styles.links}>
                    <p>Affiliated With</p>
                    <p onClick={() => window.open("https://www.geylangmethodistsec.moe.edu.sg", "_blank")}>Geylang Methodist School (Secondary)</p>
                    <p onClick={() => window.open("https://www.cmch.sg", "_blank")}>Christalite Methodist Chapel</p>
                </div>

                <div className={styles.links}>
                    <p>Associated Websites</p>
                    <p onClick={() => window.open("https://www.bb.org.sg", "_blank")}>BB Singapore</p>
                    <p onClick={() => window.open("https://members.bb.org.sg", "_blank")}>BB Members Portal</p>
                    <p onClick={() => window.open("https://portal.bb21coy.workers.dev", "_blank")}>BB 21st Portal (New)</p>
                </div>
            </div>

            <hr />

            <div className={styles.middle}>
                <div>
                    <p data-icon style={{ "--icon": "'\\f3c5'" }}>Location</p>
                    <p onClick={() => window.open("https://maps.app.goo.gl/gNWas7A5sUHMQJsm9", "_blank")}>2 Geylang East Central, Singapore 389705</p>
                </div>

                <div>
                    <p data-icon style={{ "--icon": "'\\f121'" }}>Inspired and Developed by</p>
                    <p>
                        <span onClick={() => window.open("https://github.com/BryanL2303", "_blank")}>Bryan Lee,</span>{" "}
                        <span onClick={() => window.open("https://github.com/yaboywf", "_blank")}>Dylan Yeo,</span>{" "}
                        <span onClick={() => window.open("https://github.com/yorhagengyue", "_blank")}>Geng Yue</span>
                    </p>
                </div>


                <div>
                    <div id="google_translate_element"></div>
                    <p data-warning>Translation may not be accurate</p>
                </div>
                
            </div>

            <hr />

            <div className={styles.bottom}>
                <p>&copy; 2025 BB 21<sup>st</sup> Singapore Company. All rights reserved.</p>
                <div>
					<p>This hope we have as an anchor of the soul, a hope both <strong>sure and stedfast</strong> and one which enters within the veil where Jesus has entered as a forerunner for us... Hebrews 6:19-20a</p>
				</div>
            </div>
        </footer>
    )
}

export default Footer
