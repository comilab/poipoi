const sequences: { [key: string]: number } = {}

export default function useUniqId (prefix: string) {
  if (!(prefix in sequences)) {
    sequences[prefix] = 0
  }

  const sequence = sequences[prefix]++

  const id = `${prefix}-${sequence}`

  return {
    sequence,
    id
  }
}
