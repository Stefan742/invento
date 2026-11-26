/** The catapult's sheet layout and its cut files (writers: kits/shared/sheet.mjs). */
import * as sheet from '../../shared/sheet.mjs'

export const SHEET = { w: 300, h: 200 }
export const bbox = sheet.bbox
const at = sheet.at

/** Where every part goes on the 300 × 200 sheet (x, y = top-left corner of its box, y down). */
export function layout(kit) {
  const items = [
    at(kit.base, 6, 6),
    at(kit.supportR, 204, 6),
    at(kit.supportL, 204, 94),
    at(kit.arm, 6, 90),
    at(kit.cupBottom, 126, 90),
    at(kit.cupRing, 126, 128),
  ]
  // washers (3) and caps (6) in two rows under the arm
  const discs = [...Array(3).fill(kit.washer), ...Array(6).fill(kit.cap)]
  discs.forEach((d, i) => {
    const row = Math.floor(i / 6)
    const col = i % 6
    items.push(at(d, 6 + col * 18.5 + (row ? 9 : 0), 122 + row * 18, i))
  })
  return { ...SHEET, items }
}

export const cutSvg = (kit) =>
  sheet.cutSvg(
    layout(kit),
    `INVENTO box 01 · mini catapult · ${kit.T} mm plywood · sheet ${SHEET.w} x ${SHEET.h} mm · red = cut, blue = engrave`,
  )
export const couponSvg = (kit) => sheet.couponSvg(kit.T, 'box 01')
export const sheetPictureSvg = (kit, opts) => sheet.sheetPictureSvg(layout(kit), opts)
