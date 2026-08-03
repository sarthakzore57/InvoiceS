const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function underThousand(num: number): string {
  const parts: string[] = [];
  if (num >= 100) {
    parts.push(`${ones[Math.floor(num / 100)]} Hundred`);
    num %= 100;
  }
  if (num >= 20) {
    parts.push(tens[Math.floor(num / 10)]);
    num %= 10;
  }
  if (num >= 10) {
    parts.push(teens[num - 10]);
  } else if (num > 0) {
    parts.push(ones[num]);
  }
  return parts.join(' ');
}

export function rupeesInWords(amount: number) {
  let num = Math.round(amount);
  if (num === 0) return 'Zero Rupees Only';
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const parts = [
    crore ? `${underThousand(crore)} Crore` : '',
    lakh ? `${underThousand(lakh)} Lakh` : '',
    thousand ? `${underThousand(thousand)} Thousand` : '',
    num ? underThousand(num) : '',
  ].filter(Boolean);
  return `${parts.join(' ')} Rupees Only`;
}
