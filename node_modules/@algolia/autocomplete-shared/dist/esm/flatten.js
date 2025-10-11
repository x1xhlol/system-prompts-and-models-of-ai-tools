export function flatten(values) {
  return values.reduce(function (a, b) {
    return a.concat(b);
  }, []);
}