export const generateId = (length: number = 10): string => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result + Date.now();
};

export const millisecondsToHoursAndMinutes = (unixTimeInMs: number) => {
  const dateObj = new Date(unixTimeInMs);
  const hours = dateObj.getUTCHours();
  const minutes = dateObj.getUTCMinutes();

  // padStart ensure that the hours and minutes are always displayed with 2 digits (e.g., 01, 02, 03, etc.).
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
