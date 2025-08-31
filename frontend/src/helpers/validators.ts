export function validateInt(value: string) {
  const parsedValue = parseInt(value);
  return isNaN(parsedValue) ? "Must be a number" : true;
}

export function validateIpAddr(value: string) {
  const test = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  return test.test(value) ? true : "Must be a valid IP address";
}
