import "./footer.scss"

const Footer = () => {
    return (
        <footer>
            <div>
                <p>Follow Us!</p>
                <a href="https://www.instagram.com/bb21coy/" target="_blank" rel="noreferrer" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            </div>
            <div>
                <p>Affiliated With</p>
                <div>
                    <img src="/gm.webp" width="50" height="50" alt="Geylang Methodist School (Secondary)" onClick={() => window.open("https://www.geylangmethodistsec.moe.edu.sg", "_blank")} />
                    <img src="/church.png" width="50" height="50" alt="Christalite Methodist Chapel" onClick={() => window.open("https://www.cmch.sg", "_blank")} />
                </div>
            </div>
            <div>
                <p>Associated Websites</p>
                <div>
                    <a href="https://www.bb.org.sg/" target="_blank" rel="noreferrer">HQ Website</a>
                    <a href="https://members.bb.org.sg/cos/o.x?c=/ca3_ca3bbportal/user&func=login" target="_blank" rel="noreferrer">Members Portal</a>
                </div>
                <p>Developed by Bryan Lee & Dylan Yeo</p>
            </div>
        </footer>
    )
}

export default Footer
