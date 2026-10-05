export function parseCSVPreview(csvString: string, maxRows = 5) {
  if (!csvString) return { headers: [], rows: [] };
  
  const lines = csvString.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1, maxRows + 1).map(line => 
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );
  
  return { headers, rows };
}
