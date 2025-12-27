export function toCSV(rows, columns) {
  function escape(v) {
    if (v === null || v === undefined) return '';
    const s = String(v);
    if (s.includes('"') || s.includes(',') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }
  const header = columns.map((c) => escape(c.header)).join(',');
  const body = (rows || []).map((r) =>
    columns.map((c) => {
      const v = c.format ? c.format(r[c.key], r) : r[c.key];
      return escape(v);
    }).join(',')
  ).join('\n');
  return header + '\n' + body;
}

export function downloadCSV(filename, rows, columns) {
  const csv = toCSV(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
