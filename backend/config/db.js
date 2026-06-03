const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../codeinsight.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Reviewer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    language TEXT NOT NULL,
    code TEXT NOT NULL,
    overall_score INTEGER,
    complexity_score INTEGER,
    readability_score INTEGER,
    duplication_score INTEGER,
    maintainability_score INTEGER,
    cyclomatic_complexity INTEGER,
    lines_of_code INTEGER,
    grade TEXT,
    summary TEXT,
    issues TEXT,
    suggestions TEXT,
    strengths TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.prepare(
  "INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)"
).run(1, "Demo Reviewer", "demo@codeinsight.local", "authentication-disabled", "Reviewer");

console.log("Database initialised");

module.exports = db;
