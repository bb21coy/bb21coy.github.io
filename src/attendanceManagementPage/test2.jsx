import * as XLSX from "xlsx";

function excelStyleToCss(style = {}) {
  const css = {};
  if (style?.font) {
    if (style.font.bold) css.fontWeight = "bold";
    if (style.font.color?.rgb) css.color = `#${style.font.color.rgb}`;
  }
  if (style?.fill?.fgColor?.rgb) {
    css.backgroundColor = `#${style.fill.fgColor.rgb}`;
  }
  if (style?.alignment?.horizontal) {
    css.textAlign = style.alignment.horizontal;
  }
  if (style?.alignment?.vertical) {
    css.verticalAlign = style.alignment.vertical;
  }
  if (style?.border) {
    css.border = "1px solid black"; // could expand per-side
  }
  return css;
}

export default function ExcelPreview() {
  // Generate workbook + worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Product", "Price", "Qty", "Total"],
    ["Apple", 1.5, 10, { f: "B2*C2" }],
  ]);

  // Style A1
  ws["A1"].s = {
    fill: { fgColor: { rgb: "4F81BD" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center" },
  };

  // Example: merge A1:B1
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Build styled table manually
  const range = XLSX.utils.decode_range(ws["!ref"]);
  const merges = ws["!merges"] || [];
  const mergeMap = {};

  // Build lookup for merged ranges
  for (const m of merges) {
    for (let R = m.s.r; R <= m.e.r; ++R) {
      for (let C = m.s.c; C <= m.e.c; ++C) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (R === m.s.r && C === m.s.c) {
          mergeMap[addr] = {
            master: true,
            rowSpan: m.e.r - m.s.r + 1,
            colSpan: m.e.c - m.s.c + 1,
          };
        } else {
          mergeMap[addr] = { master: false };
        }
      }
    }
  }

  const rows = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const cells = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr] || {};
      const style = excelStyleToCss(cell.s);
      const mergeInfo = mergeMap[addr];

      if (mergeInfo?.master) {
        cells.push(
          <td
            key={addr}
            style={style}
            rowSpan={mergeInfo.rowSpan}
            colSpan={mergeInfo.colSpan}
          >
            {cell.v || ""}
          </td>
        );
      } else if (!mergeInfo) {
        cells.push(
          <td key={addr} style={style}>
            {cell.v || ""}
          </td>
        );
      }
      // if mergeInfo.master === false → skip cell
    }
    rows.push(<tr key={r}>{cells}</tr>);
  }

  return (
    <table border="1" cellPadding="4" style={{ borderCollapse: "collapse" }}>
      <tbody>{rows}</tbody>
    </table>
  );
}
