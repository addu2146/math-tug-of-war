# Contributing Guidelines

Thank you for considering contributing to **Math Tug-of-War**! This document provides guidelines for participating in development.

---

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) *(to be created)*.

---

## How to Contribute

### Reporting Bugs

Found a bug? Please report it!

1. **Check existing issues** to avoid duplicates
2. **Create detailed bug report** including:
   - What you were doing when the bug occurred
   - Expected behavior vs. actual behavior
   - Screenshots/videos if applicable
   - Environment (OS, Node version, browser)
   - Steps to reproduce

**Example**:
```markdown
### Bug: Rope doesn't move on Android

**Environment**:
- OS: Android 12
- Browser: Chrome 120
- Device: Samsung Galaxy S21

**Steps to Reproduce**:
1. Launch game on Android device
2. Submit correct answer to math problem
3. Observe rope at game center

**Expected**: Rope pulls toward answering team
**Actual**: Rope stays in center position

**Screenshot**: [attach screenshot]
```

### Suggesting Features

Have an idea? We'd love to hear it!

1. Check [Things_to_add.md](../Things_to_add.md) for planned features
2. Open a **Feature Request** including:
   - Why this feature is valuable
   - How users would benefit
   - Mockups or examples (if applicable)

---

## Development Workflow

### 1. Fork & Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/math-tug-of-war.git
cd math-tug-of-war

# Add upstream for syncing
git remote add upstream https://github.com/addu2146/math-tug-of-war.git
```

### 2. Create Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bugfixes
git checkout -b bugfix/your-bug-name
```

**Branch Naming Conventions**:
- `feature/` — New features
- `bugfix/` — Bug fixes
- `security/` — Security patches
- `docs/` — Documentation updates
- `refactor/` — Code refactoring
- `test/` — Test additions
- `chore/` — Maintenance tasks

### 3. Make Changes

Follow the [Code Style Guidelines](#code-style-guidelines) below.

### 4. Test Your Changes

**Manual Testing Checklist**:

```bash
# Start development servers
npm run dev:server    # Terminal 1
npm run dev:client    # Terminal 2

# Test your changes in browser at http://localhost:5173

# Verify:
- [ ] Feature works as expected
- [ ] No console errors
- [ ] No broken existing features
- [ ] Responsive on mobile/landscape
- [ ] WebSocket messages validated
```

**Test Different Difficulties**:
```
- [ ] Easy (Addition & Subtraction)
- [ ] Medium (All operations)
- [ ] Hard (Multiplication only)
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with meaningful message
git commit -m "feat: add word problem support

- Implement ProblemParser for sentence-based math
- Add problem type selector to SetupWizard
- Update difficulty config for word problem ranges

Closes #42"
```

**Commit Message Format** (Conventional Commits):

```
<type>: <subject>

<body>

<footer>
```

- `type`: feat, fix, docs, style, refactor, test, chore
- `subject`: Present tense, imperative ("add" not "added")
- `body`: Detailed explanation (optional)
- `footer`: References issues (Closes #123)

### 6. Push & Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name

# Open PR on GitHub
# Fill in PR template:
# - Description of changes
# - Related issues
# - Testing performed
# - Screenshots (if UI changes)
```

### 7. Code Review

Maintainers will review your PR:
- ✅ Check code style
- ✅ Verify security implications
- ✅ Test functionality
- ✅ Request changes if needed

Please respond to feedback promptly.

### 8. Merge

Once approved, maintainers will merge your PR. Congratulations! 🎉

---

## Code Style Guidelines

### JavaScript/React

#### Style Rules

```javascript
// ✅ DO: Use const/let (not var)
const x = 5;
let y = 10;

// ✅ DO: Use arrow functions
const add = (a, b) => a + b;

// ✅ DO: Use async/await
async function fetchData() {
  const data = await fetch(url);
}

// ✅ DO: Meaningful variable names
const didPlayerAnswerCorrectly = true;

// ❌ DON'T: Use var
var x = 5;

// ❌ DON'T: Use callback hell
fs.readFile('a', (err, data) => {
  fs.readFile('b', (err, data2) => { ... });
});
```

#### Formatting

```javascript
// ✅ DO: 2-space indentation
function setup() {
  const config = {
    difficulty: 1,
    duration: 120,
  };
}

// ✅ DO: JSDoc comments for public APIs
/**
 * Generate a math problem.
 * @param {number} level - Difficulty level (1-3)
 * @returns {Object} Problem object with expression and answer
 */
export function generateProblem(level) { ... }

// ✅ DO: Comments for complex logic
// Split operands to prevent negative results at Easy level
if (level === 1 && a < b) [a, b] = [b, a];
```

### React Components

```jsx
// ✅ DO: Functional components with hooks
export function GameHeader({ leftScore, rightScore }) {
  return (
    <header className="flex justify-between">
      <div>{leftScore}</div>
      <div>{rightScore}</div>
    </header>
  );
}

// ✅ DO: Extract complex logic into custom hooks
function useGameTimer(duration) {
  const [time, setTime] = useState(duration);
  useEffect(() => {
    const timer = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// ❌ DON'T: Class components
class GameHeader extends React.Component { ... }

// ❌ DON'T: Inline styles (use Tailwind)
<div style={{ color: 'red' }}>Text</div>

// ✅ DO: Use Tailwind CSS
<div className="text-red-500">Text</div>
```

### Server Code

```javascript
// ✅ DO: Validate server-side (never trust client)
handleAnswer(side, answer) {
  // Validate answer against server-computed solution
  const correct = Number(answer) === this.players[side].problem.answer;
}

// ✅ DO: Log meaningful messages
console.log('[Server] Client connected');
console.error('[Server] Error processing message:', error.message);

// ❌ DON'T: Use eval()
const result = eval(`${a} + ${b}`);  // DANGEROUS!

// ✅ DO: Use mathjs for safe evaluation
const result = mathjsEvaluate(`${a} + ${b}`);
```

### File Organization

```
src/
├── components/          # React UI components
│   ├── GameHeader.jsx
│   ├── Numpad.jsx
│   └── VictoryModal.jsx
├── game/               # Game logic & Phaser scenes
│   ├── PhaserGame.jsx
│   ├── config.js
│   └── scenes/
├── hooks/              # Custom React hooks
│   ├── useWebSocket.js
│   └── useGameState.js
├── utils/              # Utilities & constants
│   └── constants.js
└── App.jsx
```

---

## Performance Considerations

### Client-Side

- [ ] Memoize expensive components (`React.memo()`)
- [ ] Use `useCallback()` for stable function references
- [ ] Lazy load routes with `React.lazy()`
- [ ] Minimize re-renders (check DevTools Profiler)
- [ ] Optimize images (use WebP, lazy load)

### Server-Side

- [ ] Avoid blocking operations in message handler
- [ ] Limit payload size (currently 5KB)
- [ ] Cache problem generation if needed
- [ ] Monitor memory usage (console.log before/after)

### Network

- [ ] Bundle messages (rope + score in one message)
- [ ] Debounce frequent updates (currently 20Hz)
- [ ] Compress large payloads if needed

---

## Security Best Practices

When adding features, ensure:

- [ ] Server validates **all** client input
- [ ] No `eval()` usage (use mathjs or similar)
- [ ] No `dangerouslySetInnerHTML` in React
- [ ] Sensitive data doesn't leak to client
- [ ] WebSocket messages are authenticated (if applicable)
- [ ] Rate limiting on frequency events
- [ ] Bounds checking on numeric inputs

See [SECURITY.md](SECURITY.md) for detailed security review.

---

## Testing

### Manual Testing Checklist

Before submitting PR, manually test:

```
Graphics & Display:
- [ ] Game renders correctly
- [ ] Characters visible and animated
- [ ] Rope displays properly
- [ ] Score board updates

Gameplay:
- [ ] Problems generate correctly at each difficulty
- [ ] Answers validate correctly
- [ ] Rope moves left/right on correct answers
- [ ] Incorrect answers don't pull rope
- [ ] Victory condition triggers at threshold
- [ ] Timer counts down properly

UI/UX:
- [ ] Numpad responds to clicks
- [ ] Team names display correctly
- [ ] Settings persist during game
- [ ] Menu navigation works
- [ ] Exit button functions

Edge Cases:
- [ ] Large team names (30 chars)
- [ ] Extremely long games (600 seconds)
- [ ] Rapid answer submissions
- [ ] WebSocket disconnect/reconnect
- [ ] Landscape/portrait rotation
```

### Automated Testing

Currently no automated tests exist. Consider adding:

```javascript
// Example Jest test
test('generateProblem returns valid answer', () => {
  const problem = generateProblem({ level: 1, operation: 'add' });
  expect(problem.answer).toBeDefined();
  expect(typeof problem.answer).toBe('number');
});
```

---

## Documentation

### When to Update Docs

Update documentation when:
- [ ] Adding new features
- [ ] Changing API signatures
- [ ] Fixing behavior (if docs were inaccurate)
- [ ] Adding new components/utilities
- [ ] Updating dependencies (with breaking changes)

### Writing Documentation

- Use **clear, simple language**
- Include **code examples** where helpful
- Add **diagrams** for complex concepts
- Link to related documentation
- Keep in sync with code

---

## Release Process

A maintainer will handle releases following [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

- MAJOR: Breaking changes (1.0.0 → 2.0.0)
- MINOR: New features, backward compatible (1.0.0 → 1.1.0)
- PATCH: Bug fixes (1.0.0 → 1.0.1)
```

**Release Checklist**:
- [ ] Update version in package.json files
- [ ] Update CHANGELOG.md
- [ ] Tag git commit: `git tag v1.1.0`
- [ ] Create GitHub Release
- [ ] Announce on relevant channels

---

## Asking Questions

Have questions? Try these resources:

1. **GitHub Discussions** — Community Q&A
2. **GitHub Issues** — Report bugs or request features
3. **Email** — [To be added] for direct contact

---

## Community

Ways to participate beyond code:

- 💬 Help answer questions in discussions
- 🎨 Suggest UI/UX improvements
- 📝 Improve documentation
- 🐛 Test and report bugs
- 📢 Spread the word!

---

## Attribution

Contributors are recognized in:
- This repository's [CONTRIBUTORS.md](CONTRIBUTORS.md) file
- Release notes
- GitHub contributors page

---

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

## Summary

Thank you for contributing to **Math Tug-of-War**! We appreciate your efforts to make this project better.

**Quick Checklist Before Submitting PR**:

- [ ] Code follows style guide
- [ ] Manual testing completed
- [ ] No console errors/warnings
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear
- [ ] Branch up-to-date with main
- [ ] Related issues referenced

Happy coding! 🚀

