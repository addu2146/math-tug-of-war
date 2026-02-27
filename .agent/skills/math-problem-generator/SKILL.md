---
name: math-problem-generator
description: Use this skill when generating dynamic arithmetic problems for educational purposes using mathjs, ensuring strict difficulty boundaries.
---

# Operational Rules
* Never utilize the standard JavaScript `eval()` function for evaluation due to security and stability concerns. Utilize `mathjs.evaluate()` for all symbolic evaluation. 
* Enforce strict difficulty bounds based on the provided pedagogical matrix. 
* Rigorously validate generated numbers to ensure no negative results occur for addition or subtraction modules intended for users under the age of eight.

# Learning Materials & Documentation
* Official `mathjs` documentation specifically regarding expression parsing and symbolic evaluation
* Custom build constraints to limit library size
