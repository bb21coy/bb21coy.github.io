import * as XLSX from "xlsx";
import { useState } from "react";
import { showMessage } from "../general/handleServerError";
import styles from "../styles/awardsUploadFile.module.scss"

function UploadFile() {
    const MAX_BYTES = 200 * 1024;
    const ALLOWED_EXT = [".xls"];
    const ttd = { 'Stage 1': "Bronze", 'Stage 2': "Silver", 'Stage 3': "Gold" };
    const mastery = { 'Stage 1': 'Basic', 'Stage 2': "Advanced", 'Stage 3': "Master" };

    const [data, setData] = useState();

    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
        if (!ALLOWED_EXT.includes(ext)) return showMessage("Invalid file type.");
        if (file.size > MAX_BYTES) return showMessage("File too large.");

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const totalData = {};

                workbook.SheetNames.forEach(sheetName => {
                    if (['Sheet7', 'Sheet8', 'Sheet9'].includes(sheetName)) return
                    const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                        header: 1,           // raw 2D array, or remove to get objects with headers
                        defval: null,        // replace empty cells with null
                        blankrows: false,
                        range: 1
                    });

                    const result = transformData(json);
                    for (const [name, badges] of Object.entries(result)) {
                        totalData[name] = totalData[name] || {};
                        Object.assign(totalData[name], badges);
                    }
                })

                console.log(totalData);
                setData(totalData);
            } catch (err) {
                console.error(err);
                showMessage("Failed to parse .xls file.");
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function transformData(json) {
        const badgeRow = json[0];
        const headerRow = json[1];
        const result = {};

        for (let col = 0; col < badgeRow.length; col++) {
            if (!badgeRow[col] && col > 0) {
                badgeRow[col] = badgeRow[col - 1];
            }
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

                const key = `${badge} ${stage}`;
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

    return (
        <div className={styles["upload-file"]}>
            {!data && <>
                <label htmlFor="upload">
                    <i className="fa-solid fa-upload"></i>
                    Upload Excel from Member's Portal (.xls):</label>
                <input type="file" accept=".xls,application/vnd.ms-excel" onChange={handleFile} id="upload" />
            </>}

            {data && <>
                <div>
                    <h3>Uploaded Data:</h3>
                    <i className="fa-solid fa-xmark" onClick={() => setData(null)}></i>
                </div>

                {Object.entries(data).map(([boy, badge]) => (
                    <div className={styles["uploaded-data"]} data-open="false" onClick={toggleSize}>
                        <div>
                            <p>{boy}</p>
                            <i className="fa-solid fa-chevron-down"></i>
                        </div>
                        <div>
                            {Object.entries(badge).map(([badge, attained]) => (
                                <div>
                                    <span>{badge}</span>
                                    <span className={attained ? "attained" : "not-attained"}>{attained ? "Attained" : "Not Attained"}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button>Upload</button>
            </>}
        </div>
    );
}

export default UploadFile