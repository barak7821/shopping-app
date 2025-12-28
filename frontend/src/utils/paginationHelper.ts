function getPageNumbers(totalPages: number, currentPage: number) {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let last = null

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
            range.push(i)
        }
    }

    for (let i of range) {
        if (last) {
            if (i - last === 2) {
                rangeWithDots.push(last + 1)
            } else if (i - last > 2) {
                rangeWithDots.push("...")
            }
        }
        rangeWithDots.push(i)
        last = i
    }

    return rangeWithDots
}

export default getPageNumbers