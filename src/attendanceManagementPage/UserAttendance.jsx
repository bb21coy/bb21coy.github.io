import { useEffect, useMemo, useState } from "react";
import Loading from "../general/Loading";
import { useUser } from "../general/UserContext";
import { db } from "../firebase";
import styles from "./userAttendance.module.scss";
import { doc, getDocs, collection, getDoc } from "@firebase/firestore";

const UserAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const { user } = useUser()

    useEffect(() => {
        const init = async () => {
            const attendanceSnap = await getDocs(collection(db, "attendance"));
            const attendance = attendanceSnap.docs.map(doc => ({ id: doc.id, attendance: doc.data()[user.id] }));

            for (let i = 0; i < attendance.length; i++) {
                if (!attendance[i].attendance) {
                    delete attendance[i]
                    continue;
                };
                const paradeSnap = await getDoc(doc(db, "parades", attendance[i].id));
                const parade = paradeSnap.data();
                attendance[i].date = parade.date.toDate().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
            }

            const sorted = attendance.sort((a, b) => {
                const dateA = new Date(a.date.replace(/(\d{2})$/, '20$1')); // "25" → "2025"
                const dateB = new Date(b.date.replace(/(\d{2})$/, '20$1'));
                return dateB - dateA;
            });

            setAttendance(sorted);
            setLoading(false);
        }

        init();
    }, [user])

    const percentage = useMemo(() => {
        const validRecords = attendance.filter(r => r && r.attendance);
        const totalPresent = validRecords.filter(r => r.attendance === "1").length;
        const totalAbsent = validRecords.filter(r => r.attendance === "0").length;
        const totalExcused = validRecords.filter(r => ["S", "E"].includes(r.attendance)).length;

        const totalCountActual = totalPresent + totalAbsent + totalExcused;
        const actualPercentage = totalCountActual > 0 ? (totalPresent / totalCountActual) * 100 : 0;

        const totalCountWeighted = totalPresent + totalAbsent;
        const weightedPercentage = totalCountWeighted > 0 ? (totalPresent / totalCountWeighted) * 100 : 0;

        return { actualPercentage, weightedPercentage };
    }, [user, attendance]);

    function getAttendanceColor(percentage) {
        const passThreshold = 75;
        const midThreshold = 80;
        const max = 100;

        if (percentage <= passThreshold) return "rgb(255, 0, 0)"; // red
        if (percentage >= max) return "rgb(0, 100, 0)"; // green

        let r, g;

        if (percentage <= midThreshold) {
            const ratio = (percentage - passThreshold) / (midThreshold - passThreshold);
            r = 255;
            g = Math.round(255 * ratio);
        } else {
            const ratio = (percentage - midThreshold) / (max - midThreshold);
            r = Math.round(255 * (1 - ratio));
            g = Math.round(255 - 155 * ratio);
        }

        return `rgb(${r}, ${g}, 0)`;
    }


    if (loading) return <Loading />

    return (
        <div className={styles["user-attendance"]}>
            <h2>User Attendance</h2>

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance.map((attendance, index) => (
                        <tr key={index}>
                            <td>{attendance.date}</td>
                            <td>{attendance.attendance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div>
                <h3>Total Attendance (Weighted): <span style={{ color: getAttendanceColor(percentage.weightedPercentage) }}>{percentage.weightedPercentage.toFixed(2)}%</span></h3>
                <p>Formula used:</p>
                <div className={styles["fraction"]}>
                    <span className="top">No. of Present (“1”)</span>
                    <span className="bottom">No. of Present (“1”) + No. of Absent (“0”)</span>
                </div>

                <h3>Actual Attendance: <span style={{ color: getAttendanceColor(percentage.actualPercentage) }}>{percentage.actualPercentage.toFixed(2)}%</span></h3>
                <p>Formula used:</p>
                <div className={styles["fraction"]}>
                    <span className="top">No. of Present (“1”)</span>
                    <span className="bottom">No. of Present (“1”) + No. of Absent (“0”) + No. of Sick (“S”) + No. of Excused (“E”)</span>
                </div>
            </div>
        </div>
    )
}

export default UserAttendance;