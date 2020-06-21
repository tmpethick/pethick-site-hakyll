export const flattened = arr => [].concat(...arr);
export const zip = rows => rows[0].map((_,c) => rows.map(row => row[c]));
