# Liu Yao Divination

## Description

Perform I Ching (Yi Jing) divination using the six-yao (六爻) method with three coin tosses. The skill generates a hexagram from coin toss results and provides AI-powered interpretation of the divination outcome.

## Input

- `question`: The question or matter to divine (string)
- `coins`: Array of 6 toss results, each with 3 coin faces (heads/tails)
- `method`: Toss method - "manual" or "auto" (string)
- `subject`: Subject category - "general", "love", "career", "wealth", "health" (string)

## Output

- `hexagram`: The primary hexagram (本卦) with 6 yao lines
- `changingLines`: Array of changing line positions
- `resultHexagram`: The resulting hexagram (变卦) after line changes
- `interpretation`: AI-generated interpretation text

## Example

```json
{
  "question": "Should I take this new job offer?",
  "subject": "career"
}
```
