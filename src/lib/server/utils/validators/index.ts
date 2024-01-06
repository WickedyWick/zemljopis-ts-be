export const isSpecialChar = (charCode: number) => {
  if (charCode < 48 || (charCode > 57 && charCode < 65) || (charCode > 90 && charCode < 97) || charCode > 122 )
    return true
  return false
}

export const containsSpecialChar = (s: string): boolean => {
  for (let i = 0; i < s.length; i++) {
    if (isSpecialChar(s.charCodeAt(i)))
      return true
  }
  return false
}