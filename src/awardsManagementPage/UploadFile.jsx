import { useState } from "react";
import { showMessage } from "../general/handleServerError";
import styles from "./uploadFile.module.scss"
import { db } from "../firebase";
import XLSX from "xlsx";
import { doc, deleteDoc, writeBatch } from "@firebase/firestore";

function UploadFile({ attained, boys }) {
    const MAX_BYTES = 200 * 1024;
    const ALLOWED_EXT = [".xls"];
    const ttd = { 'Stage 1': "Bronze", 'Stage 2': "Silver", 'Stage 3': "Gold" };
    const mastery = { 'Stage 1': 'Basic', 'Stage 2': "Advanced", 'Stage 3': "Master" };
    const [data, setData] = useState();
    const [conflicts, setConflicts] = useState();
    const [toAdd, setToAdd] = useState([]);

    function transformData(json) {
        const badgeRow = json[0];
        const headerRow = json[1];
        const result = {};

        for (let col = 0; col < badgeRow.length; col++) {
            if (!badgeRow[col] && col > 0) {
                badgeRow[col] = badgeRow[col - 1];
            }
        }

        const badgeStageCount = {};
        for (let col = 2; col < badgeRow.length; col++) {
            const badge = badgeRow[col];
            let stage = headerRow[col];
            if (!badge || !stage) continue;

            if (badge === "Total Defence") stage = ttd[stage];
            stage = mastery[stage];

            badgeStageCount[badge] = badgeStageCount[badge] || new Set();
            badgeStageCount[badge].add(stage);
        }

        for (let i = 2; i < json.length; i++) {
            const row = json[i];
            if (!row || !row[1]) continue;

            const name = row[1];
            result[name] = {};

            for (let col = 2; col < row.length; col++) {
                const badge = badgeRow[col];
                let stage = headerRow[col];
                if (!badge || !stage) continue;

                if (badge === "Total Defence") stage = ttd[stage];
                stage = mastery[stage];

                const key = badgeStageCount[badge].size === 1 ? badge : `${badge} ${stage}`;
                const val = row[col];
                result[name][key] = val === "Attained";
            }
        }

        return result;
    }


    const toggleSize = (e) => {
        const size = e.currentTarget.getAttribute('data-open');
        e.currentTarget.setAttribute('data-open', size === "false" ? "true" : "false");
    }

    const convertToXlsx = async (e) => {
        const file = e.target.files[0];

        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (!ALLOWED_EXT.includes(ext)) return showMessage("Invalid file type.");
        if (file.size > MAX_BYTES) return showMessage("File too large.");

        const fileBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(fileBuffer, { type: "array" });
        const totalData = {};

        for (const sheetName of workbook.SheetNames) {
            if (['Sheet7', 'Sheet8', 'Sheet9'].includes(sheetName)) continue
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                header: 1, defval: null,
                blankrows: false,
                range: 1
            });

            const result = transformData(rows);
            for (const [name, badges] of Object.entries(result)) {
                totalData[name] = totalData[name] || {};
                Object.assign(totalData[name], badges);
            }
        }

        setData(totalData);
    }

    const checkMergeIssues = async () => {
        // Rule 1: If portal has Basic, but HQ has Basic + Advanced → add Advanced (don’t remove Basic).
        // Rule 2: If portal has Basic + Advanced, but HQ only has Basic (or nothing) → flag as conflict.

        let normalisedUploadedData = [];
        let normalisedLocalData = [];

        for (const [boy, badge] of Object.entries(data)) {
            const boyId = boys.find(b => b.account_name === boy)?.id || null;
            if (!boyId) continue
            const existingBoyAttainments = attained.filter(a => a.startsWith(`${boyId}-`));
            normalisedLocalData.push(...existingBoyAttainments);

            for (const [badgeName, attained] of Object.entries(badge)) {
                const parts = badgeName.split(' ');
                const lastWord = parts[parts.length - 1];
                if (attained !== true) continue

                if (["Basic", "Advanced", "Master", "Bronze", "Silver", "Gold"].includes(lastWord)) {
                    const pureBadgeName = parts.slice(0, -1).join(" ");
                    normalisedUploadedData.push(`${boyId}-${pureBadgeName}-${lastWord}`)
                } else {
                    normalisedUploadedData.push(`${boyId}-${badgeName}`)
                }
            }
        }

        const hqSet = new Set(normalisedUploadedData);
        const sysSet = new Set(normalisedLocalData);

        const toAdd = [];
        const conflicts = [];

        // Rule 1: HQ has more (Portal has missing items that HQ has)
        for (const item of hqSet) {
            if (!sysSet.has(item)) {
                toAdd.push(item);
            }
        }

        // Rule 2: If portal has more (HQ has missing items that portal has)
        for (const item of sysSet) {
            if (!hqSet.has(item)) {
                conflicts.push(item);
            }
        }

        setConflicts(conflicts);
        setToAdd(toAdd);
    }

    function displayBadge(str) {
        const parts = str.split("-");
        const badgeName = parts[1];              // always exists
        const mastery = parts[2] || "";          // may not exist
        return mastery ? `${badgeName} ${mastery}` : badgeName;
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            const form = new FormData(e.target);
            const data = Object.fromEntries(form.entries());
            if (Object.keys(data).length !== conflicts.length) return showMessage("Please resolve all conflicts before submitting");

            if (conflicts.length > 0) {
                for (const [conflict, choice] of Object.entries(data)) {
                    if (choice === "delete") await deleteDoc(doc(db, "attainments", conflict));
                }
            }

            if (toAdd.length > 0) {
                const batch = writeBatch(db);
                for (const id of toAdd) {
                    const ref = doc(db, "attainments", id);
                    batch.set(ref, {});
                }

                await batch.commit();
            }

            showMessage("Awards Tracker uploaded", "success");
            window.location.reload();
        } catch (e) {
            console.error(e)
            showMessage("Failed to upload Awards Tracker")
        }
    }

    return (
        <div className={styles["upload-file"]}>
            <p>Some badge records from HQ may not match what is already in the system. To avoid losing data, we will do the following:</p>
            <ol>
                <li>If HQ shows additional attainments than the ones in the system, we will add these additionals automatically</li>
                <li>If HQ shows fewer attainments than what is already in the system, we will flag it as a conflict. You will need to review these conflicts manually.</li>
            </ol>

            {conflicts && <div className={styles.conflicts}>
                <h3>{conflicts.length} Conflicts Found</h3>
                <p>No changes will be made to the system if all conflicts are not resolved</p>

                <form id='conflict-form' onSubmit={handleSubmit} noValidate>
                    {conflicts.map(conflict => {
                        const boyName = boys.find(b => b.id === conflict.split("-")[0]).account_name;

                        return (
                            <div key={conflict}>
                                <p>In this Portal, {boyName} is recorded as having attained {displayBadge(conflict)}, but no such record could be found in uploaded HQ Awards Tracker</p>

                                <div>
                                    <input type="radio" name={conflict} id={`keep-${conflict}`} required defaultValue="keep" />
                                    <label htmlFor={`keep-${conflict}`}>Keep {displayBadge(conflict)}</label>
                                    <input type="radio" name={conflict} id={`delete-${conflict}`} required defaultValue="delete" />
                                    <label htmlFor={`delete-${conflict}`}>Delete {displayBadge(conflict)}</label>
                                </div>
                            </div>
                        )
                    })}

                    {conflicts.length === 0 && <p>No conflicts found</p>}
                </form>

                <button form='conflict-form'>Resolve Conflicts</button>
            </div>}

            {!data && <>
                <input type="file" accept=".xls,application/vnd.ms-excel" onChange={e => convertToXlsx(e)} id="upload" />
                <label htmlFor="upload">
                    <i className="fa-solid fa-upload"></i>
                    Upload Excel from Member's Portal (.xls):</label>
            </>}

            {data && !conflicts && <>
                <div>
                    <h3>Uploaded Data:</h3>
                    <i className="fa-solid fa-xmark" onClick={() => setData(null)}></i>
                </div>

                {Object.entries(data).map(([boy, badge]) => (
                    <div key={boy} className={styles["uploaded-data"]} data-open="false" onClick={toggleSize}>
                        <div>
                            <p>{boy}</p>
                            <i className="fa-solid fa-chevron-down"></i>
                        </div>
                        <div>
                            {Object.entries(badge).map(([badge, attained]) => (
                                <div key={`${boy}-${badge}`}>
                                    <span>{badge}</span>
                                    <span className={attained ? styles.attained : styles["not-attained"]}>{attained ? "Attained" : "Not Attained"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button onClick={checkMergeIssues}>Upload</button>
            </>}
        </div>
    );
}

export default UploadFile