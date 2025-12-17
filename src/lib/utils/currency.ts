// Format currency for display
export const formatCurrency = (num: number): string => {
    if (num >= 1000000000000) {
        return 'Rp ' + (num / 1000000000000).toFixed(1) + 'T';
    } else if (num >= 1000000000) {
        return 'Rp ' + (num / 1000000000).toFixed(1) + 'M';
    } else if (num >= 1000000) {
        return 'Rp ' + (num / 1000000).toFixed(1) + 'Jt';
    } else if (num >= 1000) {
        return 'Rp ' + (num / 1000).toFixed(1) + 'Rb';
    }
    return 'Rp ' + num.toString();
};

// format currency to full number
export const formatCurrencyNumber = (num: number): string => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(num);
};