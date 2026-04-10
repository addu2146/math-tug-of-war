# Installing Dependencies & Setupfor Development

## Prerequisites

Before starting, ensure your system has:

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **Git** (for version control)
- **Administrator access** (for package installation)

### Checking Your Setup

```bash
# Check Node.js version
node --version
# Expected output: v18.0.0 or higher

# Check npm version
npm --version
# Expected output: v9.0.0 or higher
```

---

## Step 1: Clone or Download Repository

### Option A: Clone with Git

```bash
git clone https://github.com/addu2146/math-tug-of-war.git
cd math-tug-of-war
```

### Option B: Download ZIP

1. Visit https://github.com/addu2146/math-tug-of-war
2. Click **Code** → **Download ZIP**
3. Extract to desired location
4. Open terminal in extracted folder

---

## Step 2: Install Root Dependencies

Install dependencies for the monorepo structure:

```bash
# From root directory
npm install

# Or shorthand
npm i
```

This creates a `node_modules/` folder in the root and installs shared dependencies.

---

## Step 3: Install Client & Server Dependencies

### Option A: Automatic Installation (Recommended)

```bash
# From root directory
npm run install:all

# This runs:
# cd client && npm install
# cd ../server && npm install
```

### Option B: Manual Installation

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Return to root
cd ..
```

---

## Step 4: Verify Installation

Check that both client and server have installed dependencies:

```bash
# Check client
ls client/node_modules | head -5
# Expected: phaser, react, react-dom, vite, tailwindcss, etc.

# Check server
ls server/node_modules | head -5
# Expected: express, ws, cors, mathjs, etc.
```

---

## Step 5: Start Development Servers

You'll need **two terminal windows** (one for server, one for client) running simultaneously.

### Terminal 1: Start Backend Server

```bash
npm run dev:server

# Expected output:
# ╔══════════════════════════════════════════╗
# ║   🎮 Math Tug-of-War Server             ║
# ║   HOST: 0.0.0.0                         ║
# ║   PORT: 3001                            ║
# ║   Mode: Same-Screen Multi-Touch         ║
# ╚══════════════════════════════════════════╝
```

**Server runs on**: `http://localhost:3001`

**What it does**:
- Starts Express HTTP server
- Opens WebSocket gateway on `:3001`
- Watches for file changes (reload on save)
- Serves static files from `client/dist` (production only)

### Terminal 2: Start Frontend Development Server

```bash
npm run dev:client

# Expected output:
#   VITE v7.3.1  ready in 234 ms
#
#   ➜  Local:   http://localhost:5173/
#   ➜  press h + enter to show help
```

**Client development server runs on**: `http://localhost:5173`

**What it does**:
- Hot module replacement (HMR) for React components
- Compiles JSX and Tailwind CSS
- Proxies API requests to backend
- Live browser refresh on save

---

## Step 6: Open in Browser

Navigate to:

```
http://localhost:5173
```

You should see the **Landing Page** of Math Tug-of-War.

---

## Troubleshooting Installation

### Error: `npm: command not found`

**Solution**: Install Node.js from https://nodejs.org/

### Error: `Cannot find module 'express'`

**Solution**: Run `npm install` in the `server/` directory:
```bash
cd server
npm install
```

### Error: `EACCES: permission denied`

**Solution** (Linux/Mac): Use `sudo` or fix npm permissions:
```bash
# Option 1: Use sudo
sudo npm install

# Option 2: Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Error: `Port 3001 already in use`

**Solution**: Kill the process using port 3001:

**Windows**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
# Find and kill process
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

**Alternative**: Change server port:
```bash
PORT=3002 npm run dev:server
```

### Error: `Port 5173 already in use`

**Solution**: Change client port:
```bash
cd client
npm run dev -- --port 5174
```

### Error: `WebSocket connection failed`

**Symptoms**: Browser console shows `WebSocket is closed before the connection is established`

**Solutions**:
1. Verify server is running: `npm run dev:server`
2. Check `client/src/utils/constants.js` has correct `WS_URL`:
   ```javascript
   export const WS_URL = 'ws://localhost:3001';
   ```
3. Verify firewall allows port 3001

---

## Dependency Structure

### Root (`package.json`)

```json
{
  "name": "math-tug-of-war",
  "workspaces": ["client", "server"]  // Monorepo structure
}
```

### Client (`client/package.json`)

```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "phaser": "^3.90.0",
    "tailwindcss": "^4.2.1"
  },
  "devDependencies": {
    "vite": "^7.3.1",
    "@vitejs/plugin-react": "^5.1.4"
  }
}
```

### Server (`server/package.json`)

```json
{
  "dependencies": {
    "express": "^5.2.1",
    "ws": "^8.19.0",
    "cors": "^2.8.6",
    "mathjs": "^15.1.1"
  }
}
```

---

## Dependency Versions Explained

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^5.2.1 | HTTP server framework |
| **ws** | ^8.19.0 | WebSocket library |
| **cors** | ^2.8.6 | Cross-origin resource sharing |
| **mathjs** | ^15.1.1 | Safe math expression evaluation |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| **react** | ^19.2.4 | UI library |
| **react-dom** | ^19.2.4 | React DOM rendering |
| **phaser** | ^3.90.0 | Game engine |
| **tailwindcss** | ^4.2.1 | CSS utility framework |
| **vite** | ^7.3.1 | Build tool & dev server |

---

## Updating Dependencies

### Check for Outdated Packages

```bash
npm outdated
```

**Output shows**:
- Current version
- Wanted version (within semver constraints)
- Latest version available

### Update All Dependencies Safely

```bash
# Update to latest within semver
npm update

# Update to absolute latest (may break compatibility)
npm update --latest

# In client/ and server/ subdirectories
cd client && npm update && cd ..
cd server && npm update && cd ..
```

### Update Specific Package

```bash
# Update specific package
npm install phaser@latest

# Downgrade to specific version
npm install phaser@3.89.0
```

### Audit for Security Vulnerabilities

```bash
# Check for vulnerabilities
npm audit

# Fix automatically (if possible)
npm audit fix

# Fixing specific vulnerability
npm audit fix --package-lock-only
```

---

## Cleaning Up Installation

### Remove All Dependencies

```bash
# Delete node_modules folders
rm -rf node_modules client/node_modules server/node_modules

# Delete package-lock files
rm -f package-lock.json client/package-lock.json server/package-lock.json
```

### Fresh Installation

```bash
# Clear npm cache
npm cache clean --force

# Reinstall everything
npm run install:all
```

---

## Environment Configuration

### Client Environment Variables

Create `client/.env.local` for development:

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_DEBUG=true
```

Reference in code:
```javascript
const wsUrl = import.meta.env.VITE_WS_URL;
```

### Server Environment Variables

Create `server/.env` for development:

```bash
PORT=3001
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=debug
```

Reference in code:
```javascript
const port = process.env.PORT || 3001;
```

---

## Production Build

### Build Client

```bash
npm run build

# Creates optimized files in client/dist/
```

**Build output**:
```
client/dist/
├── index.html
├── assets/
│   ├── main-[hash].js      (React + Phaser bundled)
│   ├── main-[hash].css     (Tailwind + component styles)
│   └── [image files]
```

### Start Production Server

```bash
# Builds client and starts server
npm run start

# Server runs on http://localhost:3001
# Serves client files from client/dist/
```

---

## Monorepo Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build client for production |
| `npm run start` | Run production server |
| `npm run dev:server` | Start dev server (watch mode) |
| `npm run dev:client` | Start Vite dev server |

---

## System Requirements

### Minimum

- Node.js v18.0.0
- npm v9.0.0
- 500MB disk space
- 4GB RAM

### Recommended

- Node.js v20.x (LTS)
- npm v10.x
- 2GB disk space (after dependencies)
- 8GB+ RAM

### Performance Tips

- Use SSD for faster npm installs
- Close unnecessary applications to free RAM
- Use `npm ci` instead of `npm install` in CI/CD (faster, more predictable)

---

## Getting Help

### Common Issues

- **Port already in use**: Kill process or change port
- **Module not found**: Run `npm install` in subdirectory
- **Slow installs**: Clear npm cache (`npm cache clean --force`)
- **Vite HMR errors**: Clear browser cache (Shift + Reload)

### Resources

- GitHub Issues: https://github.com/addu2146/math-tug-of-war/issues
- Node.js Documentation: https://nodejs.org/docs
- npm Documentation: https://docs.npmjs.com
- Vite Documentation: https://vitejs.dev

---

**Last Updated**: April 10, 2026  
**Version**: 1.0.0

