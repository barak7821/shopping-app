export const generateOrderNumber = () => {
    const digits = 8
    const length = Math.max(1, +digits)

    // Ensure the first digit isn't 0 to avoid leading zeros
    const firstDigit = Math.floor(Math.random() * 9) + 1

    let out = String(firstDigit)

    for (let i = 1; i < length; i += 1) {
        out += String(Math.floor(Math.random() * 10))
    }

    return out
}
