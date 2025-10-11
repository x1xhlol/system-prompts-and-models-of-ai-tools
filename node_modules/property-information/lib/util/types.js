let powers = 0

export const boolean = increment()
export const booleanish = increment()
export const overloadedBoolean = increment()
export const number = increment()
export const spaceSeparated = increment()
export const commaSeparated = increment()
export const commaOrSpaceSeparated = increment()

function increment() {
  return 2 ** ++powers
}
