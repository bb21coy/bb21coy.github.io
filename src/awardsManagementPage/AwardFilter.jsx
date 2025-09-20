import { Fragment, useState, useEffect, useRef } from 'react'
import styles from './awardFilter.module.scss'

const AwardsFilter = () => {
    const levelOptions = ["Sec 1", "Sec 2", "Sec 3", "Sec 4", "Sec 5"];
    const rankOptions = ["Recruit (REC)", "Private (PTE)", "Lance Corporal (LCP)", "Corporal (CPL)", "Sergeant (SGT)", "Staff Sergeant (SSG)", "Warrant Officer (WO)"];
    const [rankSelected, setRankSelected] = useState([]);
    const [levelSelected, setLevelSelected] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [search, setSearch] = useState([]);

    function toggle(value, type) {
        if (type === "level") return setLevelSelected(levelSelected.includes(value) ? levelSelected.filter(v => v !== value) : [...levelSelected, value]);
        else return setRankSelected(rankSelected.includes(value) ? rankSelected.filter(v => v !== value) : [...rankSelected, value]);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            const value = e.target.value.trim().toLowerCase();
            if (!value || value === "") return;
            setSearch((prev) => (prev.includes(value) ? prev : [...prev, value]));
            e.target.value = "";
        }
    };

    return (
        <div className={styles['awards-filter']}>
            <div>
                <label htmlFor="search"><i className="fa-solid fa-magnifying-glass"></i></label>
                <input type="search" id="search" placeholder="Search..." onKeyDown={handleKeyDown} />
            </div>

            <div>
                {[...search].reverse().map(s => <span key={s} onClick={() => setSearch(prev => prev.filter(p => p !== s))}>{s}</span>)}
            </div>

            <MultiSelectDropDown label="Rank" options={rankOptions} selected={rankSelected} setSelected={(value) => toggle(value, "rank")} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
            <MultiSelectDropDown label="Level" options={levelOptions} selected={levelSelected} setSelected={(value) => toggle(value, "level")} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
        </div>
    )
}

const MultiSelectDropDown = ({ label, options, selected, setSelected, openDropdown, setOpenDropdown }) => {
    const detailsRef = useRef(null);
    const open = openDropdown === label;
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (open && detailsRef.current) {
            const rect = detailsRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        }
    }, [open]);

    const handleToggle = (e) => {
        e.preventDefault();
        setOpenDropdown(openDropdown === label ? null : label);
    }

    return (<>
        <details ref={detailsRef} open={open}>
            <summary onClick={handleToggle}>{label}: {selected.length ? `Selected (${options.length - selected.length})` : "All"}</summary>
        </details>

        <div className={styles['dropdown-panel']} style={{ top: pos.top, left: pos.left, display: open ? "flex" : "none" }}>
            {options.map(o => (
                <Fragment key={o}>
                    <input type="checkbox" checked={selected.includes(o)} id={o} onChange={() => setSelected(o)} />
                    <label htmlFor={o}>{o}</label>
                </Fragment>
            ))}
        </div>
    </>)
}

export default AwardsFilter