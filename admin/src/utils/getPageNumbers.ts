function getPageNumbers(totalPages: number, currentPage: number) {
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | string)[] = []
  let last: number | null = null

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      range.push(i)
    }
  }

  for (const page of range) {
    if (last !== null) {
      if (page - last === 2) {
        rangeWithDots.push(last + 1)
      } else if (page - last > 2) {
        rangeWithDots.push("...")
      }
    }
    rangeWithDots.push(page)
    last = page
  }

  return rangeWithDots
}

export default getPageNumbers