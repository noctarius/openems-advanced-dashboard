const testIpv4 = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
const testIpv6 = /^(([0-9A-Fa-f]{1,4}:){7})([0-9A-Fa-f]{1,4})$|(([0-9A-Fa-f]{1,4}:){1,6}:)(([0-9A-Fa-f]{1,4}:){0,4})([0-9A-Fa-f]{1,4})$/;

export function validateInt(value: string) {
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? "Must be an integer number" : true;
}

export function validateFloat(value: string) {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? "Must be a floating point number" : true;
}

export function validateIpAddr(value: string) {
  const isIpv4 = testIpv4.test(value);
  if (isIpv4) return true;
  return testIpv6.test(value) ? true : "Must be a valid IP address";
}
