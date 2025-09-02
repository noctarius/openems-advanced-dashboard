export function objectReducer<T, P extends number | string | symbol, R>(
  array: T[],
  extractor: (value: T) => { [key in P]: R },
) {
  return array.reduce(
    (accumulator: { [key in P]: R }, value: T) => {
      return { ...accumulator, ...extractor(value) };
    },
    {} as { [key in P]: R },
  );
}

export function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}
