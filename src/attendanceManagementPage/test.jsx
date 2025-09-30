// import { utils, writeFile } from "xlsx";

export default function ExportButton() {
//   const handleExport = () => {
//     // Create a new workbook + sheet
//     const wb = utils.book_new();
//     const ws = utils.aoa_to_sheet([
//       ["Product", "Price", "Qty", "Total"],
//       ["Apple", 1.5, 10, { f: "B2*C2" }],
//     ]);

//     // Apply styles
//     ws["A1"].s = {
//       fill: { fgColor: { rgb: "4F81BD" } }, // background
//       font: { bold: true, color: { rgb: "FFFFFF" } },
//       alignment: { horizontal: "center" },
//       border: {
//         top: { style: "thin", color: { rgb: "000000" } },
//         bottom: { style: "thin", color: { rgb: "000000" } },
//       },
//     };

//     // Merge cells
//     ws["!merges"] = [{ s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }]; // merge A4:C4

//     // Set column widths
//     ws["!cols"] = [{ wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];

//     utils.book_append_sheet(wb, ws, "Report");

//     // Export
//     writeFile(wb, "report.xlsx");
//   };

  return <button onClick={handleExport}>Export Excel</button>;
}