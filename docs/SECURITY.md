# Security Review & Best Practices

## Executive Summary

**Status**: ✅ **SECURE FOR CLASSROOM/LAN DEPLOYMENT**

Math Tug-of-War implements **Zero Trust** security principles with strict server-side validation, preventing common web vulnerabilities (XSS, injection, DoS, prototype pollution). The system is suitable for educational environments and local network play.

---

## Security Audit Report
**Date**: April 10, 2026  
**Last Updated**: April 10, 2026  
**Reviewer**: Security Audit

---

## Vulnerabilities Patched

### 1. ❌ Unbounded WebSocket Payload Size (DoS Vector)

**Severity**: 🔴 CRITICAL  
**Status**: ✅ FIXED  
**CVE**: Custom (local severity)

#### Problem

The original WebSocket message handler accepted arbitrarily large text payloads before JSON parsing. A malicious client could send megabytes of data, consuming server memory and CPU.

```javascript
// VULNERABLE CODE (original)
ws.on('message', (rawMessage) => {
  const msg = JSON.parse(rawMessage.toString());  // No size check!
  // ...
});
```

**Attack Scenario**:
```javascript
// Attacker sends massive payload
ws.send('{"type":"ANSWER_SUBMITTED","answer":' + 'X'.repeat(10000000) + '}');
// Server crashes: JSON.parse() consumes 10MB per message
```

#### Solution

Added **5KB maximum payload limit** before any processing:

```javascript
ws.on('message', (rawMessage) => {
  const rawString = rawMessage.toString();
  
  // FIXED: Enforce size limit
  if (rawString.length > 5120) {  // 5KB max
    console.warn('[Server] Payload Too Large');
    return ws.close(1009, 'Payload Too Large');
  }
  
  const msg = JSON.parse(rawString);
  // ... rest of handler
});
```

**Why 5KB?**  
- Sufficient for largest expected message: `SETUP_GAME` with all config (~1KB)
- Blocks pathological inputs with 5KB+ data padding
- Prevents memory exhaustion before parsing

---

### 2. ❌ Prototype Pollution via Side Parameter

**Severity**: 🔴 CRITICAL  
**Status**: ✅ FIXED  
**Type**: Arbitrary Key Injection

#### Problem

The `side` parameter from client messages was directly used as an object key:

```javascript
// VULNERABLE CODE (original)
const msg = JSON.parse(rawMessage);
room.handleAnswer(msg.side, msg.answer);  // msg.side is untrusted!

// In GameRoom.js
handleAnswer(side, answer) {
  const player = this.players[side];  // side could be "__proto__"!
  // ...
}
```

**Attack Scenario**:
```javascript
// Attacker sends
{"type": "ANSWER_SUBMITTED", "side": "__proto__", "answer": 1}

// This sets prototype property on all objects:
player["__proto__"] = { score: 1000 };  // Pollutes object prototype
```

#### Solution

Added **strict side whitelisting**:

```javascript
// FIXED: Validate side against whitelist
if (msg.side && msg.side !== 'left' && msg.side !== 'right') {
  console.warn('[Server] Invalid side:', msg.side);
  return;  // Silently reject
}
```

**Why Whitelist?**  
- Only two valid values: `'left'` or `'right'`
- No exceptions or aliases allowed
- Type-safe: prevents prototype pollution, key injection, path traversal

---

### 3. ❌ Unsanitized Game Configuration (DoS / Data Corruption)

**Severity**: 🟠 HIGH  
**Status**: ✅ FIXED  
**Type**: Input Validation

#### Problem

Game configuration from `SETUP_GAME` was blindly trusted without bounds checking:

```javascript
// VULNERABLE CODE (original)
const room = new GameRoom(ws, msg.payload || {});

constructor(ws, config = {}) {
  this.difficulty = config.difficulty || 1;  // No bounds!
  this.teamNames = config.teamNames || { left: 'Team 1', right: 'Team 2' };  // No length limit!
  this.gameDuration = config.duration || GAME_DURATION;  // Could be 999999!
  // ...
}
```

**Attack Scenarios**:

**Scenario A: Long Team Names (XSS)**
```javascript
{ "difficulty": 1, "teamNames": { "left": "<img src=x onerror=alert('xss')>" } }
// Renders unsanitized HTML in UI → XSS vulnerability
```

**Scenario B: Extreme Duration (Memory)**
```javascript
{ "difficulty": 1, "duration": 999999999999 }
// Game runs for 27,777,777 hours → Memory leak in timer
```

**Scenario C: Invalid Difficulty**
```javascript
{ "difficulty": -1 }
// Negative difficulty breaks problem generation bounds
```

#### Solution

Hardened GameRoom constructor with **strict type coercion and bounds**:

```javascript
// FIXED: Sanitize and validate all inputs
constructor(ws, config = {}) {
  // Difficulty: must be 1, 2, or 3
  this.difficulty = Number(config.difficulty) || 1;
  if (this.difficulty < 1 || this.difficulty > 3) this.difficulty = 1;
  
  // Operations: limit to 10 max, filter strings
  this.operations = Array.isArray(config.operations) && config.operations.length > 0 
    ? config.operations.filter(op => typeof op === 'string').slice(0, 10) 
    : ['add'];
  
  // Team names: max 30 chars, force string
  this.teamNames = {
    left: (config.teamNames?.left || 'Team 1').toString().substring(0, 30),
    right: (config.teamNames?.right || 'Team 2').toString().substring(0, 30)
  };
  
  // Duration: clamp to safe range [10, 600] seconds
  this.gameDuration = Number(config.duration) || GAME_DURATION;
  if (this.gameDuration < 10 || this.gameDuration > 600) {
    this.gameDuration = GAME_DURATION;
  }
}
```

**Validation Rules Applied**:
| Parameter | Type | Constraint | Reason |
|-----------|------|-----------|--------|
| `difficulty` | number | 1-3 only | Valid difficulty levels |
| `operations` | array | Max 10 items | Prevent DOS via infinite arrays |
| `teamNames` | string | Max 30 chars | Prevent UI breakage, buffer overflow |
| `duration` | number | 10-600 seconds | Prevent infinite loops, memory leaks |

---

## Current Security Posture

### ✅ IMPLEMENTED PROTECTIONS

#### 1. Server-Authoritative Game Logic

```javascript
// Server NEVER trusts client calculations
handleAnswer(side, answer) {
  const numAnswer = Number(answer);
  // Server computes: client can only submit intent, not state
  const isCorrect = numAnswer === player.problem.answer;  // Server knows correct answer
}
```

**Why This Matters**:
- Client cannot manipulate score/streak directly
- Client cannot see answers before submission
- Game state is source-of-truth on server

---

#### 2. Strict Payload Validation (PayloadValidator.js)

```javascript
export function validateClientPayload(rawMessage) {
  try {
    const payload = JSON.parse(rawMessage);
    
    if (!payload.type || !VALID_INTENTS.has(payload.type)) {
      return { isValid: false, error: 'Invalid action type' };
    }
    
    // Type-specific validation
    if (payload.type === CLIENT_MESSAGES.ANSWER_SUBMITTED) {
      if (typeof payload.answer !== 'number') {
        return { isValid: false, error: 'Answer must be numeric' };
      }
    }
    
    return { isValid: true, data: sanitized };
  } catch (error) {
    return { isValid: false, error: 'Malformed JSON payload' };
  }
}
```

**Coverage**:
- ✅ Message type whitelist
- ✅ Field type validation
- ✅ Required field checks
- ✅ Safe error messages (no info leakage)

---

#### 3. Safe Math Evaluation (mathjs)

```javascript
// SAFE: Uses sandboxed math parser
import { evaluate as mathjsEvaluate } from 'mathjs';

const expression = `${a} ${OP_MATHJS[op]} ${b}`;  // e.g., "5 + 3"
const answer = mathjsEvaluate(expression);         // Returns 8
```

**Why Not eval()?**
- ✅ mathjs.evaluate() uses a **sandboxed parser**
- ✅ Cannot execute arbitrary JavaScript
- ✅ Only supports mathematical operations
- ❌ eval() would allow: `require('fs').unlinkSync('/etc/passwd')`

---

#### 4. React XSS Protection

```javascript
// React auto-escapes string interpolations
<div>{teamName}</div>  // Safe: even if teamName = "<img onerror=alert()>"

// React ONLY allows dangerouslySetInnerHTML for intentional HTML
// Our codebase has ZERO instances of dangerouslySetInnerHTML
```

**Verified**:
```bash
grep -r "dangerouslySetInnerHTML" client/src/
# No results → XSS vulnerability surface eliminated
```

---

#### 5. CORS Configuration

```javascript
const app = express();
app.use(cors());  // Allows cross-origin requests (safe for local network)
```

**For Production**:
```javascript
app.use(cors({
  origin: 'https://trusted-domain.com',  // Whitelist origin
  credentials: true,
  methods: ['GET', 'POST']
}));
```

---

### ⚠️ KNOWN LIMITATIONS

#### 1. No Authentication

The system has **no login mechanism**. Any client can connect and start a game.

**Risk Level**: 🟡 LOW (mitigated by local network deployment)

**Mitigation in Production**:
```javascript
// Add token-based auth
wss.on('connection', (ws, req) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!validateJWT(token)) {
    return ws.close(1008, 'Unauthorized');
  }
  // ... rest of handler
});
```

---

#### 2. No Rate Limiting

A fast attacker could flood the server with messages.

**Risk Level**: 🟡 MEDIUM (can be DDoS'd locally)

**Mitigation in Production**:
```javascript
const rateLimit = new Map();  // Track messages per IP

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  const limit = rateLimit.get(ip) ?? 0;
  
  if (limit > 100) {  // Max 100 messages per minute
    return ws.close(1008, 'Rate limit exceeded');
  }
});
```

---

#### 3. No HTTPS/WSS Enforcement

Production deployment should use encrypted connections.

**Risk Level**: 🟠 HIGH (for sensitive data)

**Mitigation in Production**:
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private.key'),
  cert: fs.readFileSync('certificate.crt')
};

https.createServer(options, app).listen(3001);
```

---

#### 4. No CSRF Protection

Since WebSocket is bidirectional, traditional CSRF is less of a concern, but session hijacking is possible.

**Risk Level**: 🟡 LOW (no authentication = can't hijack session)

**Mitigation**: Implement authentication (see #1 above)

---

## Security Checklist

### Development

- ✅ Input validation on all client data
- ✅ Server-authoritative game logic
- ✅ No eval() usage (mathjs only)
- ✅ No dangerouslySetInnerHTML (React sanitizes)
- ✅ Payload size limits (5KB max)
- ✅ Message type whitelisting
- ✅ Side parameter whitelisting
- ✅ Duration bounds checking (10-600 seconds)
- ✅ Team name length limits (30 chars)
- ❌ No authentication (acceptable for LAN)
- ❌ No rate limiting (implement for production)
- ❌ No HTTPS/WSS encryption (implement for production)

### Production Deployment Checklist

Before deploying to internet-facing server:

- [ ] Enable HTTPS/WSS (SSL/TLS certificates)
- [ ] Implement JWT or OAuth authentication
- [ ] Add rate limiting (1-10 messages/second per user)
- [ ] Enable CORS origin whitelist
- [ ] Set up request logging and monitoring
- [ ] Configure firewall rules (IDS/IPS)
- [ ] Regular security audits
- [ ] Keep dependencies updated (`npm audit fix`)
- [ ] Enable DDoS protection (Cloudflare)
- [ ] Separate database for persistence (if added)

---

## Threat Model

### Scenarios Covered

| Threat | Severity | Mitigation |
|--------|----------|-----------|
| **DoS via Large Payload** | 🔴 CRITICAL | 5KB size limit |
| **Prototype Pollution** | 🔴 CRITICAL | Side whitelist |
| **Code Injection (eval)** | 🔴 CRITICAL | mathjs sandbox |
| **XSS (stored)** | 🟠 HIGH | React escaping + data validation |
| **XSS (reflected)** | 🟠 HIGH | React escaping |
| **Invalid Game Config** | 🟠 HIGH | Input bounds checking |
| **Unauthenticated Access** | 🟡 MEDIUM | (acceptable for LAN) |
| **Rate Limiting** | 🟡 MEDIUM | (implement for production) |
| **Network Sniffing** | 🟠 HIGH | (implement WSS for production) |
| **Session Hijacking** | 🟡 LOW | (no sessions to hijack locally) |

### Scenarios NOT Covered

- **Physical theft of server** → Encrypt storage
- **N-day exploits** → Keep dependencies updated
- **Social engineering** → Training required
- **Insider threats** → Access control needed

---

## Dependency Security

### Current Dependencies

```
express@5.2.1       ✅ Maintained
ws@8.19.0           ✅ Maintained  
cors@2.8.6          ✅ Maintained
mathjs@15.1.1       ✅ Maintained
phaser@3.90.0       ✅ Maintained
react@19.2.4        ✅ Maintained
vite@7.3.1          ✅ Maintained
```

### Vulnerability Scanning

```bash
# Check for known vulnerabilities
npm audit

# Update vulnerable packages
npm audit fix

# Regular audits (recommended weekly)
npm audit --audit-level=moderate
```

---

## Incident Response Plan

### If Vulnerability is Discovered

1. **Immediate**: Disable affected feature / close server
2. **Assessment**: Identify scope and impact
3. **Fix**: Implement patch and test thoroughly
4. **Deployment**: Roll out fix to production
5. **Review**: Post-mortem to prevent recurrence

### Contact for Security Issues

[To be added: Bug bounty program or security contact email]

---

## Future Security Enhancements

1. **Database Integration** → Encrypt at rest (AES-256)
2. **Logging & Monitoring** → Detect anomalies
3. **API Rate Limiting** → Prevent brute force
4. **Web Application Firewall (WAF)** → ModSecurity
5. **Security Headers** → HSTS, CSP
6. **Penetration Testing** → Quarterly audits
7. **Dependency Management** → Automated updates

---

## References

- OWASP Top 10: https://owasp.org/Top10/
- CWE-427: Uncontrolled Search Path Element: https://cwe.mitre.org/data/definitions/427.html
- WebSocket Security Best Practices: https://nvlpubs.nist.gov/nistpubs/
- mathjs Documentation: https://mathjs.org/

---

**Last Reviewed**: April 10, 2026  
**Next Review**: October 10, 2026  
**Status**: 🟢 APPROVED FOR CLASSROOM USE

