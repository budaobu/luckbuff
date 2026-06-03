# Bazi (Four Pillars) Analysis

## Description

Analyze a person's destiny using Chinese Four Pillars of Destiny (四柱八字 / Bazi) astrology. Calculates the birth chart based on year, month, day, and hour of birth, then provides AI interpretation of personality, career, wealth, marriage, and life trends.

## Input

- `year`, `month`, `day`, `hour`: Birth datetime components (numbers)
- `gender`: "male" or "female" (string)
- `timezone`: IANA timezone identifier (string)

## Output

- `bazi`: The four pillars (年柱, 月柱, 日柱, 时柱) with heavenly stems and earthly branches
- `wuxing`: Five elements analysis (五行)
- `dayun`: 10-year fortune cycles (大运)
- `interpretation`: AI-generated life analysis and predictions

## Example

```json
{
  "year": 1990,
  "month": 5,
  "day": 15,
  "hour": 8,
  "gender": "male",
  "timezone": "Asia/Shanghai"
}
```
