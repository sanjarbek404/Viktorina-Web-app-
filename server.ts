import express from 'express';
import { createServer as createViteServer } from 'vite';
import db from './src/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username va parol kiritilishi shart' });
    }

    try {
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const info = stmt.run(username, password);
      res.json({ id: info.lastInsertRowid, username });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: 'Ushbu foydalanuvchi nomi band' });
      } else {
        res.status(500).json({ error: 'Xatolik yuz berdi' });
      }
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as any;
    
    if (user) {
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(401).json({ error: "Login yoki parol noto'g'ri" });
    }
  });

  // Quizzes: List all
  app.get('/api/quizzes', (req, res) => {
    const quizzes = db.prepare('SELECT * FROM quizzes').all();
    res.json(quizzes);
  });

  // Quizzes: Get single quiz with questions
  app.get('/api/quizzes/:id', (req, res) => {
    const quizId = req.params.id;
    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId) as any;
    
    if (!quiz) {
      return res.status(404).json({ error: 'Viktorina topilmadi' });
    }

    const questions = db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quizId) as any[];
    
    // Parse JSON options
    const parsedQuestions = questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }));

    res.json({ ...quiz, questions: parsedQuestions });
  });

  // Results: Save result
  app.post('/api/results', (req, res) => {
    const { userId, quizId, score, total } = req.body;
    
    if (!userId || !quizId || score === undefined || total === undefined) {
      return res.status(400).json({ error: "Barcha maydonlar to'ldirilishi shart" });
    }

    try {
      const stmt = db.prepare('INSERT INTO results (user_id, quiz_id, score, total) VALUES (?, ?, ?, ?)');
      stmt.run(userId, quizId, score, total);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Natijani saqlashda xatolik' });
    }
  });

  // Results: Get leaderboard for a quiz
  app.get('/api/quizzes/:id/leaderboard', (req, res) => {
    const quizId = req.params.id;
    const results = db.prepare(`
      SELECT users.username, results.score, results.total, results.created_at
      FROM results
      JOIN users ON results.user_id = users.id
      WHERE results.quiz_id = ?
      ORDER BY results.score DESC, results.created_at ASC
      LIMIT 10
    `).all(quizId);
    
    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
