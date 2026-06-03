# Qi Men Dun Jia

## Description

Calculate and interpret Qi Men Dun Jia (奇门遁甲) charts for strategic decision-making. This ancient Chinese metaphysical art analyzes spatial-temporal energy patterns to determine auspicious directions, times, and strategies.

## Input

- `year`, `month`, `day`, `hour`, `minute`: Query datetime (numbers)
- `location`: City or location name (string)
- `timezone`: IANA timezone identifier (string)
- `juType`: "yin" or "yang" (string)
- `paiPanType`: Layout type (string)

## Output

- `chart`: The Qi Men Dun Jia chart with 9 palaces (九宫)
- `stemBranch`: Heavenly stem and earthly branch for the query time
- `ju`: The遁局 (escape pattern)
- `interpretation`: AI-generated strategic advice

## Example

```json
{
  "year": 2024,
  "month": 6,
  "day": 1,
  "hour": 10,
  "minute": 30,
  "location": "Beijing",
  "timezone": "Asia/Shanghai"
}
```
