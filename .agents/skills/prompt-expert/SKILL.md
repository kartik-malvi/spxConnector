---
name: prompt-expert
description: >
  Expert skill for writing, improving, and optimizing prompts for AI models. Use whenever the
  user wants to write a prompt, improve an existing prompt, create a system prompt, or get
  structured output from AI. Triggers for "write me a prompt", "improve prompt", "system prompt",
  "few-shot", "prompt template", "make AI do X". Always use before writing any prompt.
---

# Prompt Expert

## Core Template
```
You are [ROLE].
[CONTEXT]
Task: [SPECIFIC TASK]
Output format: [FORMAT — JSON / bullets / numbered steps / prose]
Constraints:
- [CONSTRAINT 1]
- [CONSTRAINT 2]
```

## Techniques
```
// Structured JSON output
Respond ONLY with valid JSON. No markdown, no backticks, no explanation.

// Chain of thought
Think step by step. Show your reasoning before the final answer.

// Reduce hallucination
Answer only based on provided context. If not in context, say "I don't know."

// Few-shot examples
Input: X → Output: Y
Input: A → Output: B
Now do: [input]
```

## Anti-Patterns
| Bad | Better |
|---|---|
| "Be helpful" | "Answer only questions about our product" |
| "Respond as JSON" | "Respond ONLY as valid JSON. No backticks." |
| "Think carefully" | "Think step by step. Show reasoning first." |
