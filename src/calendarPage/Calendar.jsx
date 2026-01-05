import { useState, useEffect, useRef, useLayoutEffect } from "react";
import * as mammoth from "mammoth";
import styles from './calendar.module.scss'
import Header from "../general/Header";
import Footer from "../general/Footer";
import '../general/general.scss'

const Calendar = () => {
    const [html, setHtml] = useState("");
    const [search, setSearch] = useState("");
    const [matches, setMatches] = useState([]);
    const calendarRef = useRef(null);
    const [selected, setSelected] = useState(0);
    const [processedHtml, setProcessedHtml] = useState("");

    useEffect(() => {
        const loadDocx = async () => {
            const response = await fetch("/calendar.docx");
            const arrayBuffer = await response.arrayBuffer();

            const { value } = await mammoth.convertToHtml({ arrayBuffer });
            const doc = new DOMParser().parseFromString(value, "text/html");

            doc.querySelectorAll("td").forEach(td => {
                if (td.textContent.toLowerCase().includes("selected boys")) {
                    td.classList.add(styles.selected);
                }
            });

            setHtml(doc.body.innerHTML);
        };

        loadDocx();
    }, []);


    useEffect(() => {
        if (!html) return;

        const doc = new DOMParser().parseFromString(html, "text/html");
        const tables = [...doc.querySelectorAll("table")];
        const newMatches = [];
        let matchIndex = 1;

        tables.forEach(table => {
            const rows = [...table.querySelectorAll("tr")];
            if (!rows.length) return;

            const headerCells = rows[0].querySelectorAll("td[colspan]");
            if (headerCells.length < 2) return;

            const table1 = document.createElement("table");
            const table2 = document.createElement("table");
            table1.classList.add("month", "month-top");
            table2.classList.add("month", "month-bottom");

            const h1 = document.createElement("tr");
            h1.appendChild(headerCells[0].cloneNode(true));
            table1.appendChild(h1);

            const h2 = document.createElement("tr");
            h2.appendChild(headerCells[1].cloneNode(true));
            table2.appendChild(h2);

            rows.slice(1).forEach(r => {
                const cells = r.querySelectorAll("td");

                const r1 = document.createElement("tr");
                [0, 1, 2].forEach(i => cells[i] && r1.appendChild(cells[i].cloneNode(true)));
                if (r1.children.length) table1.appendChild(r1);

                const r2 = document.createElement("tr");
                [3, 4, 5].forEach(i => cells[i] && r2.appendChild(cells[i].cloneNode(true)));
                if (r2.children.length) table2.appendChild(r2);
            });

            table.replaceWith(table1, table2);

            [table1, table2].forEach(t => {
                t.querySelectorAll("p").forEach(p => {
                    const match =
                        search.length > 0 &&
                        p.textContent.toLowerCase().includes(search.toLowerCase());

                    if (match) {
                        newMatches.push(p);
                        p.id = `match-${matchIndex++}`;
                        p.classList.add(styles.highlight);
                    }
                });
            });
        });

        setMatches(newMatches);
        setProcessedHtml(doc.body.innerHTML);
    }, [html, search]);

    const scrollToIndex = (i) => {
        if (i-1 < 0 || i-1 >= matches.length) return;
        setSelected(i - 1);
        const el = document.getElementById(`match-${i}`);
        if (!el) return;

        const offset = -200; // header offset
        const top =
            window.scrollY +
            el.getBoundingClientRect().top +
            offset;

        window.scrollTo({
            top,
            behavior: "smooth"
        });
    };


    return (
        <div className={`${styles.container} box`}>
            <Header></Header>
            <div className={styles.wrapper}>
                <div className={styles.search_container}>
                    <div className={styles.bg}></div>
                    <div className={styles.search}>
                        <i className="fa-solid fa-search"></i>
                        <input type="search" id="search" value={search} placeholder="Search an Event" onChange={e => setSearch(e.target.value)} />
                        <i className="fa-solid fa-arrow-left" title="Previous" onClick={() => scrollToIndex(selected)}></i>
                        <i className="fa-solid fa-arrow-right" title="Next" onClick={() => scrollToIndex(selected + 2)}></i>
                        <div id="match-navigator-container">
                            {matches.map((text, i) => (
                                <button key={i} onClick={() => scrollToIndex(i + 1)} className={selected === i ? styles.selected : ""}>
                                    {text.textContent}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={styles.content}>
                    <p>CALENDAR 2025</p>
                    <div id="calendar" ref={calendarRef} className={styles.calendar} dangerouslySetInnerHTML={{ __html: processedHtml }} />
                </div>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default Calendar