import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import { zipSync, strToU8 } from "fflate";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, documentId, limit } from "@firebase/firestore";

import sheet1Xml from "./excel/xl/worksheets/sheet1.xml?raw";
import sheet2Xml from "./excel/xl/worksheets/sheet2.xml?raw";
import sheet3Xml from "./excel/xl/worksheets/sheet3.xml?raw";
import sheet4Xml from "./excel/xl/worksheets/sheet4.xml?raw";
import sheet5Xml from "./excel/xl/worksheets/sheet5.xml?raw";
import sheet6Xml from "./excel/xl/worksheets/sheet6.xml?raw";
import workbookRelsXml from "./excel/xl/_rels/workbook.xml.rels?raw";
import workbookXml from "./excel/xl/workbook.xml?raw";
import contentTypesXml from "./excel/[Content_Types].xml?raw";
import relsXml from "./excel/_rels/.rels?raw";
import stylesXml from "./excel/xl/styles.xml?raw";
import appCoreXml from "./excel/docProps/app.xml?raw";
import coreXml from "./excel/docProps/core.xml?raw";

const userAttendanceTemplate = (index, userInfo, userAttendance, excelColumnLetter, uniqueDates) => {
	const latestClass = Object.entries(userInfo)
		.filter(([k]) => k.startsWith("class"))
		.sort((a, b) => parseInt(b[0].slice(5)) - parseInt(a[0].slice(5)))
		.find(([_, value]) => value !== null)?.[1] || "";

	const isPrimer = userInfo.account_type === "Primer";
	const isOfficer = userInfo.account_type === "Officer";

	const rowNum = parseInt(index) + 7;
	const startCol = excelColumnLetter(7);
	const endCol = excelColumnLetter(uniqueDates.length + 6);

	return `
		<row r="${parseInt(index) + 7}">
			<c t="n" s="6" r="B${parseInt(index) + 7}">
				<v>${index + 1}</v>
			</c>
			<c t="inlineStr" s="${isPrimer || isOfficer ? "5" : "6"}" r="C${parseInt(index) + 7}">
				<is><t>${userInfo.account_type !== "Boy" ? userInfo.account_name?.toUpperCase() : (userInfo.member_id?.toUpperCase() ?? "")}</t></is>
			</c>
			<c t="inlineStr" s="5" r="D${parseInt(index) + 7}">
				<is><t>${userInfo.account_name?.toUpperCase()}</t></is>
			</c>
			<c t="inlineStr" s="6" r="E${parseInt(index) + 7}">
				<is><t>${isPrimer ? "POLY" : latestClass}</t></is>
			</c>
			<c t="inlineStr" s="6" r="F${parseInt(index) + 7}">
				<is><t>${userInfo.rank ?? ""}</t></is>
			</c>
			<c t="n" s="6" r="G${rowNum}">
				<f>IFERROR(100*COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"1")/(COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"0")+COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"1")),0)</f>
			</c>
			${uniqueDates.map((date, colIndex) => {
		const attendance = (userAttendance && userAttendance[date]) ?? null;
		if (attendance === null) return `<c s="6" r="${excelColumnLetter(colIndex + 7)}${parseInt(index) + 7}"></c>`;
		const isNumber = !isNaN(parseFloat(attendance)) && isFinite(attendance);

		return (`
					<c t="${isNumber ? "n" : "inlineStr"}" s="6" r="${excelColumnLetter(colIndex + 7)}${parseInt(index) + 7}">
						${isNumber ? `<v>${attendance}</v>` : `<is><t>${attendance}</t></is>`}
					</c>
				`)
	}).join("")}
			<c t="n" s="6" r="${excelColumnLetter(uniqueDates.length + 7)}${rowNum}">
				<f>IFERROR(100*COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"1")/(COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"0")+COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"1")+COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"S")+COUNTIF(${startCol}${rowNum}:${endCol}${rowNum},"E")),0)</f>
			</c>
			<c t="n" s="6" r="${excelColumnLetter(uniqueDates.length + 8)}${rowNum}">
				<f>COUNTIF(${startCol}${rowNum}:${endCol}${rowNum}, 1)</f>
			</c>
		</row>
	`
}

const ExportButton = ({ year, parades }) => {
	const [users, setUsers] = useState([]);
	const [paradeAttendance, setParadeAttendance] = useState({});
	const [paradeData, setParadeData] = useState([]);
	const [isLoading, setIsLoading] = useState({ users: true, attendance: true });

	const excelDate = (str) => {
		const [day, monthStr] = str.split("/");
		const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11 };
		const month = months[monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase()];
		if (month === undefined) throw new Error("Invalid month: " + monthStr);
		const d = new Date(Date.UTC(year, month, parseInt(day, 10)));
		const excelEpoch = new Date(Date.UTC(1899, 11, 30));
		return (d - excelEpoch) / (1000 * 60 * 60 * 24);
	}

	const excelColumnLetter = (colIndex) => {
		let letter = "";
		while (colIndex >= 0) {
			letter = String.fromCharCode((colIndex % 26) + 65) + letter;
			colIndex = Math.floor(colIndex / 26) - 1;
		}
		return letter;
	}

	const uniqueDates = (level) => {
		const normalisedLevel = level === 5 ? 4 : level;
		let levelUsers;
		if (typeof normalisedLevel !== "number") levelUsers = users.filter(u => u.account_type === normalisedLevel).map(u => u.account_name);
		else levelUsers = users.filter(u => u.level === normalisedLevel).map(u => u.account_name);
		const filteredAttendance = Object.entries(paradeAttendance).filter(([user, attendance]) => levelUsers.includes(user)).reduce((acc, [user, attendance]) => ({ ...acc, [user]: attendance }), {});
		const uniqueDates = Object.entries(filteredAttendance).flatMap(([user, attendance]) => Object.keys(attendance));
		return [...new Set(uniqueDates)];
	}

	const formData = (level) => {
		let levelUsers;
		const normalisedLevel = level === 5 ? 4 : level;
		if (typeof normalisedLevel !== "number") levelUsers = users.filter(u => u.account_type === normalisedLevel);
		else levelUsers = users.filter(u => u.level === normalisedLevel);

		return levelUsers.map((user, index) => userAttendanceTemplate(index, user, paradeAttendance[user.account_name], excelColumnLetter, uniqueDates(level))).join("");
	};

	const formDates = (level) => {
		return uniqueDates(level).map((date, index) => {
			return `
				<c s="7" r="${excelColumnLetter(index + 7)}5">
					<v>${excelDate(date)}</v>
				</c>
			`;
		});
	}

	const formBatch = (level) => {
		const levelUsers = users.filter(u => level === 4 ? (u.level === 4 || u.level === 5) : u.level === level);
		const batch = new Date().getFullYear() - levelUsers[0]?.level || 0;
		return batch + 1;
	}

	const formDay = (level) => {
		return uniqueDates(level).map((date, index) => {
			const [day, monthStr] = date.split("/");
			const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11 };
			const month = months[monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase()];
			const d = new Date(year, month, parseInt(day, 10));

			return `
				<c s="6" t="inlineStr" r="${excelColumnLetter(index + 7)}4">
					<is><t>${d.toLocaleDateString("en-US", { weekday: "short" })}</t></is>
				</c>
			`;
		}).join("");
	}

	const formParadeType = (level) => {
		return uniqueDates(level).map((date, index) => {
			const [day, monthStr] = date.split("/");
			const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11 };
			const month = months[monthStr.charAt(0).toUpperCase() + monthStr.slice(1).toLowerCase()];
			const d = new Date(year, month, parseInt(day, 10));
			const parade = paradeData.find(p => {
				const pd = p.date.toDate();
				return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth() && pd.getDate() === d.getDate()
			});

			return `
				<c s="7" t="inlineStr" r="${excelColumnLetter(index + 7)}6">
					<is><t>${parade?.parade_type || ""}</t></is>
				</c>
			`;
		}).join("");
	}

	const formEndingHeaders = (level) => {
		const dates = uniqueDates(level).length;
		const actualTotalHeader = `
			<c s="3" t="inlineStr" r="${excelColumnLetter(dates + 7)}4">
				<is><t>Actual Total %</t></is>
			</c>
		`;
		const actualTotalHeaderBottom = `
			<c s="3" r="${excelColumnLetter(dates + 7)}5"/>
		`;
		const actualTotalHeaderBottom1 = `
			<c s="3" r="${excelColumnLetter(dates + 7)}6"/>
		`;
		const totalParadesAttendedHeader = `
			<c s="3" t="inlineStr" r="${excelColumnLetter(dates + 8)}4">
				<is><t>Total Parades&#10;Attended</t></is>
			</c>
		`;
		const totalParadesAttendedHeaderBottom = `
			<c s="3" r="${excelColumnLetter(dates + 8)}5"/>
		`;
		const totalParadesAttendedHeaderBottom1 = `
			<c s="3" r="${excelColumnLetter(dates + 8)}6"/>
		`;
		const mergeActualTotalHeader = `
			<mergeCell ref="${excelColumnLetter(dates + 7)}4:${excelColumnLetter(dates + 7)}6"/>
		`;
		const mergeTotalParadesAttendedHeader = `
			<mergeCell ref="${excelColumnLetter(dates + 8)}4:${excelColumnLetter(dates + 8)}6"/>
		`;
		const actualTotalHeaderWidth = `
			<col min="${dates + 8}" max="${dates + 8}" width="19.36" customWidth="1"/>
		`;
		const totalParadesAttendedHeaderWidth = `
			<col min="${dates + 9}" max="${dates + 9}" width="19.36" customWidth="1"/>
		`;

		return {
			[`{{SEC_${level}_ACTUAL_TOTAL}}`]: actualTotalHeader,
			[`{{SEC_${level}_TOTAL_PARADES_ATTENDED}}`]: totalParadesAttendedHeader,
			[`{{SEC_${level}_ACTUAL_TOTAL_MERGE}}`]: mergeActualTotalHeader,
			[`{{SEC_${level}_TOTAL_PARADES_ATTENDED_MERGE}}`]: mergeTotalParadesAttendedHeader,
			[`{{SEC_${level}_ACTUAL_TOTAL_BOTTOM}}`]: actualTotalHeaderBottom,
			[`{{SEC_${level}_TOTAL_PARADES_ATTENDED_BOTTOM}}`]: totalParadesAttendedHeaderBottom,
			[`{{SEC_${level}_ACTUAL_TOTAL_BOTTOM_1}}`]: actualTotalHeaderBottom1,
			[`{{SEC_${level}_TOTAL_PARADES_ATTENDED_BOTTOM_1}}`]: totalParadesAttendedHeaderBottom1,
			[`{{SEC_${level}_ACTUAL_TOTAL_WIDTH}}`]: actualTotalHeaderWidth,
			[`{{SEC_${level}_TOTAL_PARADES_ATTENDED_WIDTH}}`]: totalParadesAttendedHeaderWidth
		}
	}

	const formAttendancePerParade = (level) => {
		let levelUsers;
		const normalisedLevel = level === 5 ? 4 : level;
		if (typeof normalisedLevel !== "number") levelUsers = users.filter(u => u.account_type === normalisedLevel).length;
		else levelUsers = users.filter(u => u.level === normalisedLevel).length;
		const dates = uniqueDates(level).map((date, index) => {
			return `
				<c s="9" r="${excelColumnLetter(index + 7)}${levelUsers + 7}">
					<f>COUNTA(${excelColumnLetter(index + 7)}7:${excelColumnLetter(index + 7)}${levelUsers + 6})</f>
				</c>
			`;
		})

		return `
			<row r="${levelUsers + 7}">
				${dates}
			</row>
		`
	}

	const formStatsBelow = (level) => {
		const accountType = isFinite(level) ? "Boys" : `${level}s`;
		let levelUsers;
		const normalisedLevel = level === 5 ? 4 : level;
		if (typeof normalisedLevel !== "number") levelUsers = users.filter(u => u.account_type === normalisedLevel).map(u => u.account_name);
		else levelUsers = users.filter(u => u.level === normalisedLevel).map(u => u.account_name);
		levelUsers = levelUsers.length;
		const dates = uniqueDates(level).length;

		const stats = `
			<row r="${levelUsers + 8}">
				<c s="10" t="inlineStr" r="F${levelUsers + 8}">
					<is><t>Total ${accountType}:</t></is>
				</c>
				<c s="11" r="G${levelUsers + 8}">
					<v>${levelUsers}</v>
				</c>
			</row>
			<row r="${levelUsers + 9}">
				<c s="10" t="inlineStr" r="F${levelUsers + 9}">
					<is><t>Total Parades/Meetings:</t></is>
				</c>
				<c s="11" r="G${levelUsers + 9}">
					<v>${dates}</v>
				</c>
			</row>
			<row r="${levelUsers + 11}">
				<c s="11" t="inlineStr" r="E${levelUsers + 11}">
					<is><t>LEGEND</t></is>
				</c>
				<c s="12" r="H${levelUsers + 11}">
					<v>1</v>
				</c>
				<c s="12" t="inlineStr" r="I${levelUsers + 11}">
					<is><t>Present</t></is>
				</c>
				<c s="12" r="K${levelUsers + 11}">
					<v>0</v>
				</c>
				<c s="12" t="inlineStr" r="L${levelUsers + 11}">
					<is><t>Absent</t></is>
				</c>
				<c s="12" t="inlineStr" r="N${levelUsers + 11}">
					<is><t>E</t></is>
				</c>
				<c s="12" t="inlineStr" r="O${levelUsers + 11}">
					<is><t>Excused</t></is>
				</c>
				<c s="12" t="inlineStr" r="Q${levelUsers + 11}">
					<is><t>S</t></is>
				</c>
				<c s="12" t="inlineStr" r="R${levelUsers + 11}">
					<is><t>Sick</t></is>
				</c>
				<c s="12" t="inlineStr" r="T${levelUsers + 11}">
					<is><t>NA</t></is>
				</c>
				<c s="12" t="inlineStr" r="U${levelUsers + 11}">
					<is><t>Not Applicable</t></is>
				</c>
			</row>
		`

		const mergeLegend = `
			<mergeCell ref="E${levelUsers + 11}:F${levelUsers + 11}"/>
		`

		return {
			[`{{SEC_${level}_STATS_BELOW}}`]: stats,
			[`{{SEC_${level}_STATS_BELOW_MERGE}}`]: mergeLegend
		}
	}

	const formDateUpdated = (level) => {
		const dates = uniqueDates(level);
		const lastDate = dates[dates.length - 1];
		if (!lastDate) return "";

		return `
			<c s="13" r="G3">
				<v>${excelDate(lastDate)}</v>
			</c>
		`
	}

	const omitMemberId = (level) => {
		const u = users.filter(u => u.account_type === level);
		return u.map((_, index) => `<mergeCell ref="C${index + 7}:D${index + 7}"/>`).join("");
	}

	const replacements = {
		"{{SEC_1_DATA}}": formData(1),
		"{{SEC_2_DATA}}": formData(2),
		"{{SEC_3_DATA}}": formData(3),
		"{{SEC_4_DATA}}": formData(4),
		"{{PRIMER_DATA}}": formData("Primer"),
		"{{OFFICER_DATA}}": formData("Officer"),
		"{{SEC_1_PARADE_DATES}}": formDates(1),
		"{{SEC_2_PARADE_DATES}}": formDates(2),
		"{{SEC_3_PARADE_DATES}}": formDates(3),
		"{{SEC_4_PARADE_DATES}}": formDates(4),
		"{{PRIMER_PARADE_DATES}}": formDates("Primer"),
		"{{OFFICER_PARADE_DATES}}": formDates("Officer"),
		"{{SEC_1_BATCH}}": formBatch(1),
		"{{SEC_2_BATCH}}": formBatch(2),
		"{{SEC_3_BATCH}}": formBatch(3),
		"{{SEC_4_BATCH}}": formBatch(4),
		"{{SEC_1_DAY}}": formDay(1),
		"{{SEC_2_DAY}}": formDay(2),
		"{{SEC_3_DAY}}": formDay(3),
		"{{SEC_4_DAY}}": formDay(4),
		"{{PRIMER_DAY}}": formDay("Primer"),
		"{{OFFICER_DAY}}": formDay("Officer"),
		"{{SEC_1_PARADE_TYPE}}": formParadeType(1),
		"{{SEC_2_PARADE_TYPE}}": formParadeType(2),
		"{{SEC_3_PARADE_TYPE}}": formParadeType(3),
		"{{SEC_4_PARADE_TYPE}}": formParadeType(4),
		"{{PRIMER_PARADE_TYPE}}": formParadeType("Primer"),
		"{{OFFICER_PARADE_TYPE}}": formParadeType("Officer"),
		...formEndingHeaders(1),
		...formEndingHeaders(2),
		...formEndingHeaders(3),
		...formEndingHeaders(4),
		...formEndingHeaders("Primer"),
		...formEndingHeaders("Officer"),
		"{{SEC_1_ATTENDANCE_PER_PARADE}}": formAttendancePerParade(1),
		"{{SEC_2_ATTENDANCE_PER_PARADE}}": formAttendancePerParade(2),
		"{{SEC_3_ATTENDANCE_PER_PARADE}}": formAttendancePerParade(3),
		"{{SEC_4_ATTENDANCE_PER_PARADE}}": formAttendancePerParade(4),
		"{{PRIMER_ATTENDANCE_PER_PARADE}}": formAttendancePerParade("Primer"),
		"{{OFFICER_ATTENDANCE_PER_PARADE}}": formAttendancePerParade("Officer"),
		...formStatsBelow(1),
		...formStatsBelow(2),
		...formStatsBelow(3),
		...formStatsBelow(4),
		...formStatsBelow("Primer"),
		...formStatsBelow("Officer"),
		"{{SEC_1_DATE_UPDATED}}": formDateUpdated(1),
		"{{SEC_2_DATE_UPDATED}}": formDateUpdated(2),
		"{{SEC_3_DATE_UPDATED}}": formDateUpdated(3),
		"{{SEC_4_DATE_UPDATED}}": formDateUpdated(4),
		"{{PRIMER_DATE_UPDATED}}": formDateUpdated("Primer"),
		"{{OFFICER_DATE_UPDATED}}": formDateUpdated("Officer"),
		"{{CURRENT_YEAR}}": year,
		"{{PRIMER_OMIT_MEMBER_ID}}": omitMemberId("Primer"),
		"{{OFFICER_OMIT_MEMBER_ID}}": omitMemberId("Officer"),
	};

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const usersSnap = await getDocs(query(collection(db, "users"), where("graduated", "==", false), where("roll_call", "==", true), orderBy("level", "asc"), orderBy("account_name", "asc")));
				const users = usersSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
				setUsers(users);
				setIsLoading(prev => ({ ...prev, users: false }));
			} catch (error) {
				console.error(error);
			}
		};

		fetchUsers();
	}, [])

	useEffect(() => {
		setIsLoading(prev => ({ ...prev, attendance: true }));
		const getYearAttendanceRecord = async () => {
			try {
				const y = parseInt(year)
				const start = new Date(y, 0, 1);
				const end = new Date(y + 1, 0, 1);

				const paradesData = parades.filter(parade => {
					const date = parade.date.toDate();
					return date >= start && date < end;
				});
				setParadeData(paradesData)

				for (const parade of paradesData) {
					const attendance = await getDocs(query(collection(db, "attendance"), where(documentId(), "==", parade.id), limit(1)))
					attendance.docs.map((doc) => {
						const d = parade.date.toDate();
						const parts = new Intl.DateTimeFormat("en-GB", {
							day: "2-digit",
							month: "short"
						}).formatToParts(d);
						const formatted = `${parts.find(p => p.type === "day").value}/${parts.find(p => p.type === "month").value}`;

						Object.entries(doc.data()).forEach(([userId, attendance]) => {
							const user = users.find(u => u.id === userId)
							if (user) {
								setParadeAttendance(prev => {
									return {
										...prev,
										[user.account_name]: {
											...prev[user.account_name],
											[formatted]: attendance
										}
									}
								})
							}
						});
					})
				}

				setIsLoading(prev => ({ ...prev, attendance: false }));
			} catch (error) {
				console.error(error);
			}
		}

		getYearAttendanceRecord();
	}, [year, users, parades])

	const handleExport = () => {
		const files = {
			"_rels/.rels": relsXml,
			"docProps/app.xml": appCoreXml,
			"docProps/core.xml": coreXml,
			"xl/_rels/workbook.xml.rels": workbookRelsXml,
			"xl/worksheets/sheet1.xml": sheet1Xml,
			"xl/worksheets/sheet2.xml": sheet2Xml,
			"xl/worksheets/sheet3.xml": sheet3Xml,
			"xl/worksheets/sheet4.xml": sheet4Xml,
			"xl/worksheets/sheet5.xml": sheet5Xml,
			"xl/worksheets/sheet6.xml": sheet6Xml,
			"xl/styles.xml": stylesXml,
			"xl/workbook.xml": workbookXml,
			"[Content_Types].xml": contentTypesXml
		};

		const u8files = {};
		for (const [path, xml] of Object.entries(files)) {
			let replaced = xml;
			for (const [search, value] of Object.entries(replacements)) {
				replaced = replaced.replaceAll(search, value);
			}
			u8files[path] = strToU8(replaced);
		}

		const allLevels = [1, 2, 3, 4, "Primer", "Officer"].map(level => uniqueDates(level)).flat();
		const parsed = allLevels.map(date => {
			const monthMap = {
				Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
				Jul: 6, Aug: 7, Sept: 8, Oct: 9, Nov: 10, Dec: 11,
			};
			const [day, mon] = date.split("/");
			const year = new Date().getFullYear();
			return new Date(year, monthMap[mon], parseInt(day, 10));
		})
		let latest;
		if (parsed.length === 0) {
			latest = new Date(year, 11, 31);
		} else {
			latest = parsed.reduce((a, b) => (a > b ? a : b));
		}

		const formatted = latest.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});

		const zipped = zipSync(u8files);
		const blob = new Blob([zipped], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
		});
		saveAs(blob, `BB Attendance updated on ${formatted}.xlsx`);
	};

	return <i className="fa-solid fa-download" title={`Download ${year} Attendance File`} onClick={isLoading.users || isLoading.attendance ? null : handleExport}></i>;
}

export default ExportButton;