export function formatOfferDate(dateString: Date | string | null | undefined): string | null {
    if (!dateString) return null;
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    // ensure valid date
    if (isNaN(d.getTime())) return null;

    // Use UTC to avoid the local timezone shift that would turn midnight UTC into the previous day
    const day = d.getUTCDate().toString().padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = monthNames[d.getUTCMonth()];
    const year = d.getUTCFullYear();
    return `${day} ${m} ${year}`;
}

export function formatOfferDateRange(start: Date | string | null | undefined, end: Date | string | null | undefined): string | null {
    const s = formatOfferDate(start);
    const e = formatOfferDate(end);
    if (s && e) return `${s} \u2013 ${e}`; // Use en-dash
    if (s) return `Starts: ${s}`;
    if (e) return `Ends: ${e}`;
    return null;
}
