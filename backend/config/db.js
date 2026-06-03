const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "../codeinsight.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'Developer',
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

// Seed demo users
const bcrypt = require("bcryptjs");

const seedUsers = [
  { name: "Alex Rivera", email: "dev@codeinsight.io", password: "demo1234", role: "Senior Dev" },
  { name: "Sam Chen",    email: "student@uni.edu",    password: "learn123", role: "CS Student" },
];

const insertUser = db.prepare(
  "INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
);

for (const u of seedUsers) {
  const hashed = bcrypt.hashSync(u.password, 10);
  insertUser.run(u.name, u.email, hashed, u.role);
}

console.log("✅ Database initialised");

module.exports = db;
