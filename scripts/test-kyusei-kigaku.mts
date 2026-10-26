import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { calculateKyuseiPaipan, yearStarOf } from '../server/utils/tools/kyusei-kigaku.ts'

function chart(date: string, hour: any, timezone = 'Asia/Tokyo') {
  return calculateKyuseiPaipan({
    birthDate: date,
    birthHour: hour,
    gender: 'male',
    location: { name: 'test', latitude: 35.68, longitude: 139.76, timezone },
  })
}

describe('Nine Star Ki pure calculations', () => {
  it('fixes five known charts and exact Risshun boundaries', () => {
    const cases = [
      ['1986-03-15', '卯', 5, 1, 1],
      ['1990-07-10', '午', 1, 3, 6],
      ['2026-02-01', '午', 2, 9, 7],
      ['2026-02-05', '午', 1, 8, 2],
      ['2026-01-31', '午', 2, 9, 6],
    ] as const
    for (const [date, hour, year, month, day] of cases) {
      const result = chart(date, hour)
      assert.equal(result.natal.yearStar.star, year, `${date} year`)
      assert.equal(result.natal.monthStar.star, month, `${date} month`)
      assert.equal(result.natal.dayStar.star, day, `${date} day`)
    }
  })

  it('changes year and month at the 2028 term instant', () => {
    const before = chart('2028-02-04', '子')
    assert.equal(before.natal.yearStar.star, 9)
    assert.equal(before.natal.monthStar.star, 3)
    const after = chart('2028-02-04', '酉')
    assert.equal(after.natal.yearStar.star, 8)
    assert.equal(after.natal.monthStar.star, 2)
  })

  it('selects the Rat-hour star by the classical day-branch group', () => {
    assert.equal(chart('2026-02-05', '子').natal.hourStar.star, 4)
    assert.equal(chart('2026-02-05', '午').natal.hourStar.star, 7)
  })

  it('places every nine-palace board without blanks and maps the inclined palace', () => {
    const result = chart('1986-03-15', '卯')
    assert.equal(result.boards.length, 4)
    for (const board of result.boards) {
      assert.equal(board.stars.length, 9)
      assert.deepEqual([...new Set(board.stars.map(item => item.palace))].sort(), [1, 2, 3, 4, 5, 6, 7, 8, 9])
      assert.ok(board.signals.length > 0)
    }
    assert.ok(result.natal.inclinedPalace.palace >= 1 && result.natal.inclinedPalace.palace <= 9)
  })

  it('uses the documented star-year formula', () => {
    assert.equal(yearStarOf(2026), 1)
    assert.equal(yearStarOf(2024), 3)
    assert.equal(yearStarOf(2025), 2)
  })
})
