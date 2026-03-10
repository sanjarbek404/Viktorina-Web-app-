export interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  image_url: string;
  questions: Question[];
}

const initialQuizzes: Quiz[] = [
  {
    id: 1,
    title: 'Umumiy Bilimlar',
    description: 'Turli sohalarga oid qiziqarli savollar',
    image_url: 'https://picsum.photos/seed/knowledge/800/600',
    questions: [
      { id: 1, question_text: "O'zbekistonning poytaxti qaysi shahar?", options: ['Samarqand', 'Buxoro', 'Toshkent', 'Navoiy'], correct_option_index: 2 },
      { id: 2, question_text: 'Dunyodagi eng katta ummon qaysi?', options: ['Atlantika', 'Tinch', 'Hind', 'Shimoliy Muz'], correct_option_index: 1 },
      { id: 3, question_text: 'Quyosh tizimidagi eng katta sayyora?', options: ['Yer', 'Mars', 'Yupiter', 'Saturn'], correct_option_index: 2 }
    ]
  },
  {
    id: 2,
    title: 'IT va Texnologiyalar',
    description: 'Dasturlash va texnologiya olami',
    image_url: 'https://picsum.photos/seed/tech/800/600',
    questions: [
      { id: 4, question_text: "HTML so'zining kengaytmasi nima?", options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correct_option_index: 0 },
      { id: 5, question_text: 'React qaysi kompaniya tomonidan yaratilgan?', options: ['Google', 'Apple', 'Meta (Facebook)', 'Microsoft'], correct_option_index: 2 },
      { id: 6, question_text: 'Qaysi biri dasturlash tili emas?', options: ['Python', 'Java', 'HTML', 'C++'], correct_option_index: 2 }
    ]
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDb = {
  async login(username: string, password: string) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === username && u.password === password);
    if (!user) throw new Error("Login yoki parol noto'g'ri");
    return { id: user.id, username: user.username };
  },
  
  async register(username: string, password: string) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find((u: any) => u.username === username)) throw new Error("Bu foydalanuvchi nomi band");
    const newUser = { id: Date.now(), username, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return { id: newUser.id, username: newUser.username };
  },
  
  async getQuizzes() {
    await delay(300);
    return initialQuizzes.map(q => ({ id: q.id, title: q.title, description: q.description, image_url: q.image_url }));
  },
  
  async getQuizById(id: string | number) {
    await delay(300);
    const quiz = initialQuizzes.find(q => q.id === Number(id));
    if (!quiz) throw new Error("Viktorina topilmadi");
    return quiz;
  },
  
  async saveResult(userId: number, username: string, quizId: number, score: number, total: number) {
    await delay(300);
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    results.push({ userId, username, quizId: Number(quizId), score, total, created_at: new Date().toISOString() });
    localStorage.setItem('results', JSON.stringify(results));
    return { success: true };
  },
  
  async getLeaderboard(quizId: string | number) {
    await delay(300);
    const results = JSON.parse(localStorage.getItem('results') || '[]');
    const quizResults = results.filter((r: any) => r.quizId === Number(quizId));
    quizResults.sort((a: any, b: any) => b.score - a.score || new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return quizResults.slice(0, 10);
  }
};
