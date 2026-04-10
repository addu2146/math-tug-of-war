# Game Mechanics & Rules

## Overview

Math Tug-of-War is a **turn-less, simultaneous dual-problem** game where two players race against each other to solve math problems. Correct answers pull their side of a rope toward victory.

---

## Core Gameplay Loop

### Setup Phase

1. **Difficulty Selection** — Choose Easy, Medium, or Hard
2. **Team Configuration** — Set team names and game duration
3. **Character Selection** — Customize team appearance (optional)
4. **Game Initiation** — Server assigns initial problems

### Game Phase

1. **Problem Display** — Each player sees their own unique problem
2. **Answer Input** — Player uses glassmorphic numpad to enter answer
3. **Submission** — Player taps SUBMIT button
4. **Validation** — Server validates answer locally
5. **Feedback** — Immediate visual/audio feedback (correct/incorrect)
6. **Rope Physics** — Correct answer pulls rope toward that team
7. **New Problem** — Next problem automatically generated
8. **Loop** — Repeat steps 1-7 until victory or timeout

### End Game Phase

1. **Victory Detection** — Team reaches rope threshold (±180px)
2. **Winner Announcement** — Victory modal shows winner
3. **Score Display** — Final scores and performance stats
4. **Play Again** — Option to restart or return to menu

---

## Difficulty Levels

### Difficulty 1: Easy

**Operations**: Addition & Subtraction  
**Operand Range**: 1-12  
**Constraint**: No negative results for subtraction (A ≥ B enforced)  
**Example Problems**:
- 5 + 7 = 12
- 9 - 3 = 6
- 11 + 2 = 13

**Typical Player**: Young students (ages 5-8)

---

### Difficulty 2: Medium

**Operations**: Addition, Subtraction, Multiplication  
**Operand Range**: 1-20  
**Constraint**: None (negative results allowed)  
**Example Problems**:
- 14 + 8 = 22
- 17 - 9 = 8
- 6 × 5 = 30

**Typical Player**: Primary school students (ages 8-11)

---

### Difficulty 3: Hard

**Operations**: Multiplication only  
**Operand Range**: 2-12  
**Constraint**: None  
**Example Problems**:
- 7 × 8 = 56
- 12 × 11 = 132
- 3 × 9 = 27

**Typical Player**: Older students / advanced learners (ages 10+)

---

## Scoring System

### Points

- **Correct Answer**: +1 point
- **Incorrect Answer**: +0 points (no penalty)

### Streak Tracking

A **streak** represents consecutive correct answers:

- Correct answer → Streak increments
- Incorrect answer → Streak resets to 0
- Streak displayed on UI for motivation

**Visual Feedback**:
- Streak = 1: No badge
- Streak = 3-5: Bronze badge 🥉
- Streak = 6-10: Silver badge 🥈
- Streak = 10+: Gold badge 🥇

---

## Rope Physics

### Rope Model

- **21 nodes** arranged horizontally across the screen
- **800 pixels** total rope length
- **40 pixels** per segment (800 ÷ 20)
- **Gravity**: 0.4px per frame² (sags naturally)
- **Damping**: 98.5% (smooth, realistic swing)

### Rope Movement

```
Initial Position: x=0 (center)

Left Team Correct Answer: centerOffset -= 12px (toward left)
Right Team Correct Answer: centerOffset += 12px (toward right)

[Left] ←←← ROPE ←← Neutral ←← ROPE ←← [Right]
```

### Victory Condition

When rope's horizontal offset reaches **±180 pixels**, that team wins:

```
Victory Threshold L: centerOffset ≤ -180
Victory Threshold R: centerOffset ≥ +180

Example:
Score: Left 8, Right 6
L pulls: -12 × 8 = -96px (not yet victory)
R pulls: +12 × 6 = +72px
Net: -96 + 72 = -24px (left ahead but not winning)

If left gets 7 more correct: -96 + 84 = -12px... keep pulling
If left gets 15+ more: -96 + 180 = +84px... wait, that's toward RIGHT!
Actually: -96 points for left, need to get to -180 total
-96 + ? ≤ -180
? ≤ -84
So left needs 84 more points, or 7 more if right doesn't answer
```

### Constraint Relaxation

Each physics frame:
1. Apply force from scoring
2. Update node velocities (Verlet integration)
3. Apply gravity to interior nodes
4. Pin endpoints to target positions
5. Run **8 constraint iterations** to enforce rope segment lengths
6. Result: Natural rope sag with tight connections

---

## Game Duration

### Default Duration

- **120 seconds** (2 minutes) standard game
- Configurable: **10-600 seconds**

### Timer Rules

- Counts down from set duration
- Display: MM:SS format (e.g., 2:15)
- When timer reaches 0: Game ends immediately
- Winner: Team with highest score

### Timer Edge Cases

If both teams tied when timer expires:
- Display: "TIE GAME"
- No winner (draw result)
- Option to "Play Again" with same settings

---

## Answer Validation

### Server-Side Validation

All answer checking happens on the **server** (authoritative computation).

```javascript
// Server logic (NEVER trust client)
handleAnswer(side, answer) {
  const clientAnswer = Number(answer);
  const serverAnswer = currentProblem.answer;
  
  if (clientAnswer === serverAnswer) {
    ✓ CORRECT
  } else {
    ✗ INCORRECT
  }
}
```

### Why Server-Side?

- ✅ Prevents cheating (client can't modify score)
- ✅ Consistent game state across players
- ✅ No local exploits (can't manipulate problem answers)
- ❌ Client sees only current problem, not answer key

### Feedback Timing

After submission:
- **Immediate** (~50ms): Correct/incorrect display
- **Simultaneous**: New problem generation
- **Next tick** (~50ms): Rope animation updates

---

## Input Methods

### Numpad (Primary)

Glassmorphic numeric keypad with:
- **Buttons 0-9**: Digit entry
- **Backspace**: Clear last digit
- **Clear**: Erase entire input
- **Submit**: Confirm and send answer

**Touch-Friendly**:
- Large button size (60px × 60px)
- Visual feedback on tap
- No accidental triggers

### Keyboard (Alternative)

Players can also use keyboard:
- **0-9**: Enter digits
- **Backspace**: Delete last digit
- **Enter**: Submit answer
- **Escape**: Clear input

### Accessibility

- [ ] (Planned) Voice input for accessibility
- [ ] (Planned) High contrast mode
- [ ] (Planned) Screen reader support

---

## Game States

### WAITING

- Game not started
- SetupWizard active
- Players configuring settings

**Transition**: `WAITING` → `SETUP` (SETUP_GAME received) → `PLAYING` (Server broadcasts GAME_START)

### SETUP

- Configuration received
- Problems being generated
- Initial state being computed

**Duration**: ~100-500ms

**Transition**: `SETUP` → `PLAYING`

### PLAYING

- Game loop active
- Answers being submitted
- Rope updating in real-time

**Conditions**:
- Timer > 0 seconds
- Rope not at victory threshold
- Game not paused

**Transition**: `PLAYING` → `GAME_OVER` (victory or timeout)

### GAME_OVER

- Victory achieved or timer expired
- Winner announced
- Scores displayed
- Player can PLAY_AGAIN or return to menu

**Transition**: `GAME_OVER` → `SETUP` (PLAY_AGAIN) or `WAITING` (menu)

---

## Problem Generation

### Algorithm

```
FOR EACH player requiring new problem:
  1. Get difficulty config (bounds, allowed operations)
  2. Randomly select operation from allowed list
  3. Generate two random operands within bounds
  4. For subtraction at Easy level: ensure A ≥ B
  5. Build expression: "A OP B" (e.g., "7 + 3")
  6. Evaluate using mathjs (safe sandbox)
  7. Return { id, expression, answer, level, operation }
```

### Problem Distribution

**Easy Level (1-12 addition/subtraction)**:
```
30 addition (all combinations of 1-12)
30 subtraction (all combinations with A ≥ B)
```

**Medium Level (1-20 all ops)**:
```
100 addition
100 subtraction
~78 multiplication (2-12 range recommended)
```

**Hard Level (multiplication 2-12)**:
```
121 multiplication combinations (11 × 11)
```

### Uniqueness

Each problem has unique `id` (UUID). Problems can repeat across game sessions, but each player's current problem is unique within a game session.

---

## Feedback Mechanisms

### Visual Feedback

**Correct Answer**:
- ✅ Green checkmark appears briefly
- 🎉 Confetti animation (optional)
- ⬅️⬅️ Rope pulls toward team
- 📈 Score increments with animation

**Incorrect Answer**:
- ❌ Red X appears briefly
- 🔴 Screen shake (subtle)
- 🔄 Streak resets (badge disappears)
- Problem stays on screen (no new problem yet)

### Audio Feedback

**Correct Answer**: "Ding!" sound (pleasant tone)  
**Incorrect Answer**: "Buzzer" sound (less pleasant)  
**Victory**: Success fanfare / complete music theme  
**Time Running Out**: Urgency sound at 10 seconds remaining  

### UI Updates

- **Score**: Updates immediately
- **Streak**: Updates immediately with badge animation
- **Timer**: Counts down every second
- **Rope**: Updates smoothly (physics every 50ms)

---

## Multiplayer Dynamics

### Simultaneous Play

Both players answer different problems concurrently. There's no "turn" system.

```
Timeline:
t=0.0s  Left receives problem, Right receives problem
t=2.3s  Left submits answer → rope pulls -12px
t=3.1s  Right submits answer → rope pulls +12px
t=3.2s  Left receives new problem
t=4.8s  Right receives new problem
t=5.1s  Left submits answer → rope pulls -12px
...
```

### Catching Up

If one player gets ahead on rope position:

```
Left leads: -96px (8 correct answers)
Right lags: +36px (3 correct answers)

For Right to catch up to neutral (0px):
Right must answer 9-10 more times without Left answering.

If both keep answering at equal rate:
Left maintains lead → Left likely wins.
```

### Comeback Mechanics

- No "catch-up" bonus (fairness)
- No "slowdown" for leading team (no rubber-banding)
- Pure meritocracy based on answer speed + accuracy

---

## Rage Quit Mechanics

If a player forfeits:

1. Opponent automatically wins
2. Game ends immediately
3. Winner announced as "Opponent (by surrender)"
4. Play Again option available

**Why Allow Rage Quit?**
- Graceful exit from unwinnable situation
- Respects player agency
- Prevents participation trophy situations

---

## Tie-Breaking Rules

### Rope Position (Primary)

First player to reach ±180px wins, regardless of score.

Example:
```
Left: 5 correct answers, rope at -180px ✅ WINS
Right: 12 correct answers, rope at +150px ⏱ Still playing

Left wins because rope reached threshold first.
```

### Score (If No Rope Victory)

If timer expires before rope victory:
- Team with highest score wins
- If tied: Result is "TIE"

Example:
```
Timer expires at 0:00
Left: 8 correct answers (8 points)
Right: 6 correct answers (6 points)
Rope: -24px (not at threshold)

Left wins by score (8 > 6)
```

---

## Accessibility Considerations

### Current

- ✅ Large touch targets
- ✅ Clear visual contrast
- ✅ Landscape-only (prevents small text)

### Planned

- [ ] Screen reader support
- [ ] Keyboard-only play
- [ ] High contrast mode
- [ ] Voice input
- [ ] Text-to-speech for problems

---

## Balance & Tuning

### Difficulty Tuning

All three difficulty levels are calibrated for different age groups:

| Level | Ideal Age | Problems/Min* | Success Rate |
|-------|-----------|--------------|--------------|
| 1 (Easy) | 5-8 | 6-10 | 80-90% |
| 2 (Medium) | 8-11 | 4-8 | 70-85% |
| 3 (Hard) | 10+ | 3-6 | 60-80% |

*Approximate answers per minute (varies by student ability)

### Rope Pull Tuning

Each correct answer pulls rope **12 pixels**:

```
Rope length: 800px
Victory threshold: ±180px per team
At 12px per answer: Need 15 more answers than opponent to win

If both answer at equal rate: Game is about speed + tie-breaking
If one answers faster: Compounding advantage

Example: Left answers 1 extra per minute
After 2 minutes: Left has +2 advantage = +24px = already ahead
After 10 minutes: Left has +10 advantage = +120px (close to win)
```

### Game Duration

- **Default 120s**: Good for quick classroom rounds
- **Tournament 180s**: Better for competitive play
- **Limited **10s--**: Quick-fire challenge
- **Extended 600s**: Marathon endurance test

Choose based on classroom time constraints.

---

## Cheating Mitigation

### Strategies Used

1. **Server-Authoritative Answer Checking** — Client can't fake answers
2. **No Answer Preview** — Client never sees answer key
3. **Random Problem Generation** — Each session different
4. **Tight Answer Validation** — Must match exactly (no "close enough")
5. **Rate Limiting** (planned) — Prevent automated attacks

### What Cheating Can't Do

- ❌ Increase score without correct answers
- ❌ See opponent's problems
- ❌ Manipulate rope position
- ❌ Speed up timer
- ❌ View answer key

### What Cheating CAN Do (Unmitigated)

- ⚠️ (Low concern) Use external calculator for fast computation
- ⚠️ (Not applicable) Brute-force answer by random guessing (server validates)

**Mitigation**: Use in supervised classroom setting.

---

## Performance Metrics

### Server-Side

- Tick rate: **20Hz** (50ms per update)
- Message processing: **<2ms** per message
- Physics calculation: **<1ms** per frame
- Problem generation: **<0.5ms** per problem

### Network

- Payload size: **~500-1000 bytes** per STATE_UPDATE
- Latency tolerance: **±500ms** acceptable (graceful)

### Client-Side

- Frame rate target: **60FPS** (Phaser rendering)
- WebSocket message parsing: **<1ms**
- React re-render: **<5ms** for state changes

---

## Future Game Mechanics

Potential enhancements (from Things_to_add.md):

1. **Word Problems** — Sentence-based math problems
2. **Operation Selection** — Players choose difficulty mid-game
3. **Power-ups** — Temporary boosts (faster problem, slow time)
4. **Combo Multiplier** — Streak reaches ×2, ×3 score
5. **Difficulty Scaling** — Auto-adjust based on performance
6. **Cross-Network Play** — Compete with distant classrooms

---

## Game Balance Philosophy

**"Meritocratic Simplicity"**

- Fastest, most accurate player wins
- No randomness in rope mechanics (deterministic)
- No catch-up mechanics (no rubber-banding)
- No luck-based elements
- Rewards sustained focus and speed

This ensures fair, predictable, educational gameplay.

