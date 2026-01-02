# Database GUI Tools - Alternatives for Mac

Since pgAdmin can be tricky to install, here are better alternatives for connecting to your local PostgreSQL database.

## 🏆 Recommended: TablePlus (Best for Mac)

### Why TablePlus?
- ✅ Native macOS application (feels like a Mac app)
- ✅ Beautiful, modern interface
- ✅ Fast and lightweight
- ✅ Free for personal use
- ✅ Easy to install

### Installation
```bash
# Using Homebrew
brew install --cask tableplus

# Or download from: https://tableplus.com/
```

### Connection Steps
1. Open TablePlus
2. Click **"Create a new connection"** or **"+"** button
3. Select **PostgreSQL**
4. Enter connection details:
   - **Name**: `Local DevBridge`
   - **Host**: `localhost`
   - **Port**: `5433`
   - **User**: `postgres`
   - **Password**: `devbridge_local_password`
   - **Database**: `devbridge`
5. Click **"Test"** to verify connection
6. Click **"Connect"**

### Features
- Beautiful query editor
- Table data viewer/editor
- Index browser
- Query history
- Export data to CSV/JSON

---

## 🍎 Postico (Mac-Specific)

### Why Postico?
- ✅ Designed specifically for macOS
- ✅ Simple and elegant
- ✅ Great for quick database browsing
- ✅ One-time purchase ($49)

### Installation
```bash
# Using Homebrew
brew install --cask postico

# Or download from: https://eggerapps.at/postico/
```

### Connection Steps
1. Open Postico
2. Click **"New Favorite"**
3. Enter:
   - **Host**: `localhost`
   - **Port**: `5433`
   - **User**: `postgres`
   - **Password**: `devbridge_local_password`
   - **Database**: `devbridge`
4. Click **"Connect"**

---

## 🆓 DBeaver (Free & Powerful)

### Why DBeaver?
- ✅ Completely free and open-source
- ✅ Cross-platform (Mac, Windows, Linux)
- ✅ Very powerful features
- ✅ Great for complex queries

### Installation
```bash
# Using Homebrew
brew install --cask dbeaver-community

# Or download from: https://dbeaver.io/download/
```

### Connection Steps
1. Open DBeaver
2. Click **"New Database Connection"** (plug icon)
3. Select **PostgreSQL**
4. Enter:
   - **Host**: `localhost`
   - **Port**: `5433`
   - **Database**: `devbridge`
   - **Username**: `postgres`
   - **Password**: `devbridge_local_password`
5. Click **"Test Connection"**
6. Click **"Finish"**

---

## 💻 VS Code Extensions (If you use VS Code)

### Option 1: PostgreSQL Extension
**Extension**: `ms-ossdata.vscode-postgresql`

1. Install extension in VS Code
2. Open Command Palette (`Cmd+Shift+P`)
3. Type: `PostgreSQL: Add Connection`
4. Enter connection details:
   - Host: `localhost`
   - Port: `5433`
   - Database: `devbridge`
   - Username: `postgres`
   - Password: `devbridge_local_password`

### Option 2: SQLTools Extension
**Extension**: `mtxr.sqltools-driver-pg`

1. Install SQLTools and PostgreSQL driver
2. Click SQLTools icon in sidebar
3. Click **"Add New Connection"**
4. Select **PostgreSQL**
5. Enter connection details

---

## 🖥️ Command Line (Simplest - No Installation)

### Using psql (Already Available)
```bash
# Direct connection
psql postgresql://postgres:devbridge_local_password@localhost:5433/devbridge

# Or step by step
psql -h localhost -p 5433 -U postgres -d devbridge
# Password: devbridge_local_password
```

### Using Docker Exec (Easiest)
```bash
docker exec -it devbridge-postgres psql -U postgres -d devbridge
```

### Useful psql Commands
```sql
-- List all tables
\dt

-- Describe a table
\d Device

-- List all indexes
\di

-- Switch database
\c devbridge

-- Quit
\q
```

---

## 🌐 Browser-Based Options

### Adminer (Lightweight Web Tool)
```bash
# Run Adminer in Docker
docker run -d \
  --name adminer \
  -p 8080:8080 \
  --link devbridge-postgres:db \
  adminer

# Then open: http://localhost:8080
# System: PostgreSQL
# Server: devbridge-postgres
# Username: postgres
# Password: devbridge_local_password
# Database: devbridge
```

### pgAdmin Web (If Desktop App Installed)
- pgAdmin 4 desktop app runs a local web server
- Usually accessible at: `http://127.0.0.1:5050`
- But requires desktop app to be installed first

---

## 📊 Quick Comparison

| Tool | Type | Cost | Ease of Use | Best For |
|------|------|------|-------------|----------|
| **TablePlus** | Desktop | Free/Paid | ⭐⭐⭐⭐⭐ | Mac users, daily use |
| **Postico** | Desktop | $49 | ⭐⭐⭐⭐⭐ | Mac users, simplicity |
| **DBeaver** | Desktop | Free | ⭐⭐⭐⭐ | Power users, complex queries |
| **VS Code Ext** | Extension | Free | ⭐⭐⭐⭐ | Developers using VS Code |
| **psql** | CLI | Free | ⭐⭐⭐ | Quick queries, scripts |
| **Adminer** | Web | Free | ⭐⭐⭐ | Browser-based access |

---

## 🎯 Recommendation

**For Mac users**: **TablePlus** is the best choice
- Native Mac app
- Beautiful interface
- Easy to install
- Free for personal use

**Quick Install**:
```bash
brew install --cask tableplus
```

Then connect using:
- Host: `localhost`
- Port: `5433`
- Database: `devbridge`
- Username: `postgres`
- Password: `devbridge_local_password`

---

## Connection Details (All Tools)

```
Host: localhost
Port: 5433
Database: devbridge
Username: postgres
Password: devbridge_local_password
```

---

## Troubleshooting

### Can't Connect?
1. Verify database is running:
   ```bash
   docker ps | grep postgres
   ```

2. Start database if needed:
   ```bash
   cd /Users/karim-f/Code/nivostack-monorepo-checkout
   bash scripts/database/start-local-database.sh
   ```

3. Test connection:
   ```bash
   docker exec devbridge-postgres psql -U postgres -d devbridge -c "SELECT 1;"
   ```

