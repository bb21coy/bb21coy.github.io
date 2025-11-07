import React, { useEffect, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { collection, onSnapshot } from "@firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "@firebase/auth";
import { useUser } from '../general/UserContext';
import styles from './userAccountsSmallPage.module.scss'

// Display list of Boy Accounts
const UserAccountsListSmall = ({ usersList, setUsersList, showUser, pageState }) => {
    const { user } = useUser();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [groups, setGroups] = useState(["Secondary 1", "Secondary 2", "Secondary 3", "Secondary 4/5", "Graduated", "Primers", "Officers"]);

    useEffect(() => {
        const ref = collection(db, "users");
        const unsub = onSnapshot(ref, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsersList(data)
        })

        return () => unsub();
    }, [])

    const groupedUsers = useMemo(() => {
        let officers = [];
        let primers = [];
        let boys = [];
        const graduated = [];

        for (const u of usersList) {
            if (u.g === true) graduated.push(u);
            else if (u.t === "Officer") officers.push(u);
            else if (u.t === "Primer") primers.push(u);
            else if (u.t === "Boy") boys.push(u);
        }

        boys.sort((a, b) => {
            if (a.l !== b.l) return a.l - b.l;
            return a.n.localeCompare(b.n);
        });

        if (user.appointment && user.appointment.includes("PS") && user.t === "Boy") {
            const parts = user.appointment.split(" ");
            const secLevel = parts.at(-2);

            let level = [secLevel];
            setGroups(["Secondary " + secLevel, "Graduated"]);
            if (secLevel === "4") {
                level = ["4", "5"]
                setGroups(["Secondary 4/5", "Graduated"]);
            }
            boys = boys.filter(b => level.includes(String(b.l)));
        }

        if (["Primer", "Boy"].includes(user.t)) {
            officers = [];
            setGroups(prev => prev.filter(g => g !== "Officers"));
        };

        if (user.t === "Boy") {
            primers = [];
            setGroups(prev => prev.filter(g => g !== "Primers"));
        };

        return { officers, primers, boys, graduated };
    }, [usersList]);

    const convertRank = (rank, type) => {
        const OFFICER_RANK_MAP = { O: "OCT", J: "2LT", L: "LTA" };
        const PRIMER_RANK_MAP = { C: "CLT", S: "SCL" };
        const BOY_RANK_MAP = { R: "REC", P: "PTE", L: "LCP", C: "CPL", S: "SGT", W: "SSG", O: "WO" };

        if (type === "Officer") return OFFICER_RANK_MAP[rank];
        if (type === "Primer") return PRIMER_RANK_MAP[rank];
        if (type === "Boy") return BOY_RANK_MAP[rank];
    }

    return (
        <div id='all-users'>
            <div className={styles.card_container} >
                {groups.map((g, i) => {
                    const baseTop = i * 150;
                    const shift = hoveredIndex !== null && i > hoveredIndex ? 450 : 0;
                    let users = [];
                    if (g.startsWith("Secondary")) {
                        const level = g === "Secondary 4/5"
                            ? ["4", "5"]
                            : [g.split(" ")[1]]; // e.g., "Secondary 3" → "3"

                        users = groupedUsers.boys.filter(b => level.includes(String(b.l)));
                    } else {
                        users = groupedUsers[g.toLowerCase()];
                    }

                    return (
                        <div
                            key={i}
                            className={`${styles.card} ${hoveredIndex === i ? styles.active : ""}`}
                            style={{ top: baseTop + shift, "--height": 20 * users?.length ?? 0 }}
                            onClick={() => setHoveredIndex(prev => prev === i ? null : i)}
                        >
                            <p>{g} <span>{users.length} Users</span></p>

                            {users.map(user => (
                                <p key={user.id} onClick={hoveredIndex === i ? () => showUser(user.id) : null}>{convertRank(user.r, user.t)} {user.n}</p>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

UserAccountsListSmall.propTypes = {
    usersList: PropTypes.array,
    setUsersList: PropTypes.func,
    showUser: PropTypes.func,
    pageState: PropTypes.string
}

export default UserAccountsListSmall