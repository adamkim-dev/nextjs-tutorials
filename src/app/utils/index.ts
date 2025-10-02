export const Utility = {
  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  },
  
  formatDateTime: (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${day} ${month}, ${formattedHours}:${minutes} ${ampm}`;
  },

  // Format tiền: chỉ 1 số sau dấu thập phân nếu cần, số nguyên thì không có phần thập phân
  formatMoney: (value: number | string | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
    if (!Number.isFinite(num)) return '0';
    const rounded = Math.round(num * 10) / 10; // làm tròn tới 1 chữ số thập phân
    const isInteger = Math.abs(rounded - Math.round(rounded)) < 1e-9;
    return isInteger ? `${Math.round(rounded)}` : rounded.toFixed(1);
  },
};
