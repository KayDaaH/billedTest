export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const ye = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(date);
  const mo = new Intl.DateTimeFormat("fr", { month: "long" }).format(date);
  const da = new Intl.DateTimeFormat("fr", { day: "2-digit" }).format(date);
  const month = mo.charAt(0).toUpperCase() + mo.slice(1);
  let DisplayedMonth;
  if (month === "Juin") {
    DisplayedMonth = "Juin";
  } else if (month === "Juillet") {
    DisplayedMonth = "Juil";
  } else {
    DisplayedMonth = month.substr(0, 3);
  }
  return `${parseInt(da)} ${DisplayedMonth}. ${ye.toString().substr(2, 4)}`;
};

export const revertDateFormat = (date) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  const monthMap = {
    "Jan.": "01",
    "Fév.": "02",
    "Mar.": "03",
    "Avr.": "04",
    "Mai.": "05",
    "Juin.": "06",
    "Juil.": "07",
    "Aoû.": "08",
    "Sep.": "09",
    "Oct.": "10",
    "Nov.": "11",
    "Déc.": "12",
  };

  const [day, month, year] = date.split(" ");
  const monthStr = monthMap[month];
  const dayStr = day.length < 2 ? `0${day}` : day;
  const fullYear = `20${year}`;

  return `${fullYear}-${monthStr}-${dayStr}`;
};

export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente";
    case "accepted":
      return "Accepté";
    case "refused":
      return "Refused";
  }
};
