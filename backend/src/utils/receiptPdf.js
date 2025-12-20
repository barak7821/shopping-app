import PDFDocument from "pdfkit"

const formatMoney = value => {
  const amount = Number.isFinite(+value) ? +value : 0
  return amount.toFixed(2)
}

const formatDate = date =>
  new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))

export const generateReceiptPdfBuffer = order =>
  new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 })
      const chunks = []

      doc.on("data", chunk => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      buildReceipt(doc, order)

      doc.end()
    } catch (err) {
      reject(err)
    }
  })

const buildReceipt = (doc, order) => {
  const shopName = "Your Store"
  const shopAddressLines = ["1234 Company St,", "Company Town, ST 12345"]
  const supportEmail = "support@yourstore.com"
  const accent = "#0b3b78"
  const muted = "#5a5a5a"
  const lightGray = "#f3f5f8"

  // Header block
  doc.font("Helvetica-Bold").fontSize(16).fillColor("#111").text(shopName, 50, 48)
  doc.fontSize(10).fillColor(muted)
  shopAddressLines.forEach((line, idx) => {
    doc.text(line, 50, 70 + idx * 14)
  })

  doc
    .lineWidth(1)
    .strokeColor("#c9d4e5")
    .stroke()
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(accent)
    .text("LOGO PLACEHOLDER", 320, 58, { align: "center", width: 215 })

  doc
    .font("Helvetica-Bold")
    .fontSize(24)
    .fillColor(accent)
    .text("RECEIPT", 50, 140, { align: "right", width: 495, characterSpacing: 2 })

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(accent)
    .text("Receipt", 320, 190, { width: 90 })
    .text("Receipt date", 320, 206, { width: 90 })

  const receiptNumber = order.orderNumber

  doc
    .font("Helvetica")
    .fillColor("#111")
    .text(String(receiptNumber), 430, 190, { align: "right", width: 115 })
    .text(formatDate(order.createdAt), 430, 206, { align: "right", width: 115 })

  // Customer & Order Info
  let y = 190

  doc.font("Helvetica-Bold").fontSize(11).fillColor(accent).text("Billed To", 50, y)
  const addressLine = [
    order.shippingAddress?.street,
    order.shippingAddress?.city,
    order.shippingAddress?.zip,
    order.shippingAddress?.country,
  ]
    .filter(Boolean)
    .join(", ")

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#111")
    .text(order.shippingAddress?.name || order.userName || "Guest", 50, y + 18)
    .text(order.shippingAddress?.email || order.userEmail || "", 50, y + 34)
    .text(order.shippingAddress?.phone || "", 50, y + 50)

  if (addressLine) doc.text(addressLine, 50, y + 66)

  y += 120

  // Items table
  const col = { qty: 50, desc: 95, unit: 395, total: 475 }

  doc.rect(50, y, 495, 22).fill(accent)
  doc.font("Helvetica-Bold").fillColor("#fff").fontSize(10)
  doc.text("QTY", col.qty, y + 6)
  doc.text("Description", col.desc, y + 6)
  doc.text("Unit Price", col.unit, y + 6, { width: 70, align: "right" })
  doc.text("Amount", col.total, y + 6, { width: 70, align: "right" })

  y += 30

  let subtotal = 0

  const items = order.orderItems || []
  for (const it of items) {
    const qty = +it.selectedQuantity
    const unit = +it.itemPricePerUnit
    const line = qty * unit
    subtotal += line

    const description = `${it.itemTitle || "Product"}${it.selectedSize ? ` • ${it.selectedSize}` : ""}`

    doc.font("Helvetica").fontSize(10).fillColor("#111")
    const descriptionHeight = doc.heightOfString(description, { width: 270 })
    const rowHeight = Math.max(descriptionHeight, doc.currentLineHeight())

    doc.text(String(qty), col.qty, y, { width: 30, align: "right" })
    doc.text(description, col.desc, y, { width: 270 })
    doc.text(formatMoney(unit), col.unit, y, { width: 70, align: "right" })
    doc.text(formatMoney(line), col.total, y, { width: 70, align: "right" })

    y += rowHeight + 10
  }

  doc.moveTo(50, y).lineTo(545, y).strokeColor("#c9d4e5").stroke()
  y += 14

  // Summary
  const shipping = 0
  const discount = 0
  const total = subtotal + shipping - discount

  const summaryX = 300
  const summaryWidth = 245

  const row = (label, value) => {
    doc.font("Helvetica").fontSize(10).fillColor("#111").text(label, summaryX, y, { width: 120 })
    doc.text(value, summaryX + 120, y, { width: 120, align: "right" })
    y += 16
  }

  row("Subtotal", formatMoney(subtotal))
  row("Shipping", formatMoney(shipping))
  if (discount) row("Discount", `- ${formatMoney(discount)}`)

  doc
    .rect(summaryX, y - 2, summaryWidth, 22)
    .fill(lightGray)
  doc.fillColor(accent).font("Helvetica-Bold").fontSize(11)
  doc.text(`Total`, summaryX + 6, y + 4, { width: 120 })
  doc.text(formatMoney(total), summaryX, y + 4, {
    width: summaryWidth - 8,
    align: "right",
  })
  y += 30

  // Footer
  const notesY = Math.max(y + 40, 640)
  doc.fontSize(10).fillColor(accent).text("Notes", 50, notesY)
  doc
    .fontSize(9)
    .fillColor("#333")
    .text(
      "Thank you for your purchase! All sales are final after 30 days. Please retain this receipt for warranty or exchange purposes.",
      50,
      notesY + 16,
      { width: 495 }
    )
    .text(
      `For questions or support, contact us at ${supportEmail}.`,
      50,
      notesY + 46,
      { width: 495 }
    )
}
