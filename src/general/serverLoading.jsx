import { useEffect, useRef } from "react";
import { gsap, CSSPlugin } from "gsap";
import styles from "./serverLoading.module.scss";
import axios from "redaxios";
import { useNavigate } from "react-router-dom";
import '../general/general.scss';

export default function App() {
    const logoRef = useRef();
    const screenRef = useRef();
    const navigate = useNavigate();
    gsap.registerPlugin(CSSPlugin);

    useEffect(() => {
        const el = logoRef.current;

        const xStart = -700;
        const xEnd = 0;
        const hops = 5;
        const hopDistance = (xEnd - xStart) / hops;

        gsap.set(el, {
            x: xStart,
            y: 0,
            transformOrigin: "center bottom"
        });

        const tl = gsap.timeline();

        for (let i = 1; i <= hops; i++) {
            const xPos = xStart + hopDistance * i;

            tl.to(el, {
                scaleY: 0.95,
                scaleX: 1.05,
                rotation: 15,
                duration: 0.12,
                ease: "power1.in"
            })
            tl.to(el, {
                x: xPos,
                y: -70,              // jump height
                scaleX: 0.9,
                scaleY: 1.1,
                rotation: -4,
                duration: 0.35,
                ease: "power2.out"   // jump up fast, slow at top
            })
                .to(el, {
                    y: 0,
                    scaleX: 1.1,
                    scaleY: 0.9,
                    rotation: 0,
                    duration: 0.1,
                    ease: "bounce.out"   // land + squash
                })
                .to(el, {
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    duration: 0.25,
                    ease: "power1.out"   // settle
                });
        }

        gsap.set("#box", {
            y: -1000,      // start above the screen
            scaleX: 1,
            scaleY: 1,
        });

        gsap.timeline({ delay: 6 })
            // Fall down
            .to("#box", {
                y: 0,
                duration: 0.6,
                ease: "bounce.out", // gravity-like bounce
            })

            // Squash on impact
            .to("#box", {
                scaleX: 1.2,
                scaleY: 0.7,
                duration: 0.12,
                ease: "power2.out",
            })

            // Return to normal shape
            .to("#box", {
                scaleX: 1,
                scaleY: 1,
                duration: 0.2,
                ease: "power2.inOut",
            });

        const interval = setInterval(() => {
            axios.get("https://fweb-project.onrender.com/api/auth/login")
                .then(() => {
                    clearInterval(interval);
                    gsap.to(screenRef.current, {
                        opacity: 0,
                        duration: 0.8,
                        ease: "power2.out",
                        onComplete: () => navigate("/login")
                    });
                })
        }, 3000)
    }, []);

    return (
        <div className={styles.server_loading} id="server_loading" ref={screenRef}>
            <div>
                <img ref={logoRef} src="/bb-crest.png" alt="logo" />

                <div id="box">
                    <h1>THE BOYS' BRIGADE</h1>
                    <p>21st Singapore Company</p>
                </div>
            </div>

            <p>System initialising. Please wait...</p>
        </div>
    );
}