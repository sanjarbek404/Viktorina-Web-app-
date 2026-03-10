import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve(process.cwd(), 'quiz.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON array of strings
    correct_option_index INTEGER NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
  );
`);

// Seed initial data if empty
const quizCount = db.prepare('SELECT COUNT(*) as count FROM quizzes').get() as { count: number };

if (quizCount.count === 0) {
  const insertQuiz = db.prepare('INSERT INTO quizzes (title, description, image_url) VALUES (?, ?, ?)');
  const insertQuestion = db.prepare('INSERT INTO questions (quiz_id, question_text, options, correct_option_index) VALUES (?, ?, ?, ?)');

  const quiz1 = insertQuiz.run('Umumiy Bilimlar', 'Turli sohalarga oid qiziqarli savollar', 'https://picsum.photos/seed/knowledge/800/600');
  insertQuestion.run(quiz1.lastInsertRowid, "O'zbekistonning poytaxti qaysi shahar?", JSON.stringify(['Samarqand', 'Buxoro', 'Toshkent', 'Navoiy']), 2);
  insertQuestion.run(quiz1.lastInsertRowid, 'Dunyodagi eng katta ummon qaysi?', JSON.stringify(['Atlantika', 'Tinch', 'Hind', 'Shimoliy Muz']), 1);
  insertQuestion.run(quiz1.lastInsertRowid, 'Quyosh tizimidagi eng katta sayyora?', JSON.stringify(['Yer', 'Mars', 'Yupiter', 'Saturn']), 2);

  const quiz2 = insertQuiz.run('IT va Texnologiyalar', 'Dasturlash va texnologiya olami', 'https://picsum.photos/seed/tech/800/600');
  insertQuestion.run(quiz2.lastInsertRowid, "HTML so'zining kengaytmasi nima?", JSON.stringify(['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language']), 0);
  insertQuestion.run(quiz2.lastInsertRowid, 'React qaysi kompaniya tomonidan yaratilgan?', JSON.stringify(['Google', 'Apple', 'Meta (Facebook)', 'Microsoft']), 2);
  insertQuestion.run(quiz2.lastInsertRowid, 'Qaysi biri dasturlash tili emas?', JSON.stringify(['Python', 'Java', 'HTML', 'C++']), 2);
}

export default db;
