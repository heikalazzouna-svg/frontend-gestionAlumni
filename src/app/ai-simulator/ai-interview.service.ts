import { Injectable } from '@angular/core';

export interface InterviewQuestion {
  id: number;
  text: string;
  type: 'behavioral' | 'technical' | 'situational' | 'career';
  category: string;
}

export interface QuestionFeedback {
  questionId: number;
  questionText: string;
  answerText: string;
  score: number;
  details: {
    content: number;
    structure: number;
    technical: number;
    soft: number;
  };
  strengths: string[];
  improvements: string[];
  suggestion: string;
  tips: string[];
  responseTime?: number;
}

export interface InterviewSession {
  id: string;
  jobType: string;
  level: string;
  sector: string;
  interviewType: string;
  duration: string;
  difficulty: string;
  startedAt: string;
  endedAt?: string;
  totalTime?: number;
  questions: InterviewQuestion[];
  answers: string[];
  feedback: QuestionFeedback[];
  overallScore?: number;
  categoryScores?: { content: number; structure: number; technical: number; soft: number };
  badge?: string;
}

@Injectable({ providedIn: 'root' })
export class AiInterviewService {
  private STORAGE_KEY = 'ai_interview_history_v1';
  private questionId = 1;

  private behavioralQuestions: Record<string, string[]> = {
    general: [
      'Parlez-moi de vous et de votre parcours.',
      'Pourquoi ce poste vous interesse-t-il ?',
      'Quelles sont vos principales forces et faiblesses ?',
      'Ou vous voyez-vous dans 5 ans ?',
      'Pourquoi devrions-nous vous embaucher ?',
      'Comment gerez-vous le stress et la pression ?',
      'Decrivez une situation ou vous avez fait preuve de leadership.',
      'Parlez-moi d un echec professionnel et ce que vous en avez appris.',
      'Comment vous decrirait votre ancien manager ?',
      'Quelle est votre plus grande realisation professionnelle ?',
      'Comment gerez-vous les critiques constructives ?',
      'Decrivez votre environnement de travail ideal.',
      'Comment restez-vous motive(e) au quotidien ?',
      'Quelle est la decision la plus difficile que vous ayez prise ?',
      'Comment conciliez-vous vie professionnelle et vie personnelle ?',
    ],
    stage: [
      'Pourquoi avez-vous choisi cette formation ?',
      'Quels projets academiques vous ont le plus marque ?',
      'Qu attendez-vous de ce stage ?',
      'Comment organisez-vous votre travail pendant les etudes ?',
    ],
    senior: [
      'Comment formez-vous et accompagnez-vous les juniors ?',
      'Decrivez une situation de gestion de crise technique.',
      'Comment prenez-vous des decisions strategiques ?',
      'Parlez-moi d un moment ou vous avez du convaincre la direction.',
    ]
  };

  private technicalQuestions: Record<string, string[]> = {
    'dev-backend': [
      'Expliquez la difference entre une API REST et GraphQL.',
      'Comment concevez-vous une architecture microservices ?',
      'Expliquez le principe SOLID avec des exemples.',
      'Comment gerez-vous les transactions dans une base de donnees ?',
      'Quelle est la difference entre SQL et NoSQL ? Quand utiliser l un ou l autre ?',
      'Comment optimisez-vous les performances d une API REST ?',
      'Expliquez le concept de caching et ses strategies.',
      'Comment gerez-vous la securite dans une application backend ?',
      'Decrivez le pattern MVC et ses avantages.',
      'Comment gerez-vous les migrations de base de donnees en production ?',
    ],
    'dev-frontend': [
      'Quelle est la difference entre SSR et CSR ?',
      'Comment optimisez-vous les performances d une application web ?',
      'Expliquez le Virtual DOM et son fonctionnement.',
      'Comment gerez-vous l etat dans une application frontend complexe ?',
      'Quelle est votre approche pour le responsive design ?',
      'Comment gerez-vous l accessibilite (a11y) dans vos projets ?',
      'Expliquez la difference entre CSS Grid et Flexbox.',
      'Comment structurez-vous un projet Angular/React de grande taille ?',
    ],
    'dev-fullstack': [
      'Comment assurez-vous la communication entre frontend et backend ?',
      'Decrivez votre workflow de developpement typique.',
      'Comment gerez-vous l authentification et l autorisation ?',
      'Expliquez le concept de CI/CD et comment vous l implementez.',
      'Comment gerez-vous les WebSockets dans une application temps reel ?',
      'Quelle est votre strategie de test (unitaire, integration, e2e) ?',
      'Comment deployez-vous une application full-stack en production ?',
    ],
    'dev-mobile': [
      'Quelles sont les differences entre developpement natif et cross-platform ?',
      'Comment gerez-vous le stockage local sur mobile ?',
      'Comment optimisez-vous la batterie dans une app mobile ?',
      'Expliquez le concept de deep linking.',
    ],
    'data': [
      'Expliquez la difference entre supervised et unsupervised learning.',
      'Comment evaluez-vous les performances d un modele ML ?',
      'Qu est-ce que l overfitting et comment l eviter ?',
      'Decrivez votre processus de nettoyage de donnees.',
      'Comment choisissez-vous le bon algorithme pour un probleme donne ?',
      'Expliquez le concept de feature engineering.',
      'Comment deployez-vous un modele ML en production ?',
      'Quelle est la difference entre precision et recall ?',
    ],
    'pm': [
      'Comment priorisez-vous les fonctionnalites d un produit ?',
      'Decrivez votre approche de la methodologie Agile/Scrum.',
      'Comment gerez-vous les conflits entre parties prenantes ?',
      'Comment mesurez-vous le succes d un produit ?',
      'Decrivez un projet que vous avez mene de A a Z.',
    ],
    'design': [
      'Comment menez-vous une recherche utilisateur ?',
      'Quelle est votre approche du Design Thinking ?',
      'Comment gerez-vous les retours negatifs sur vos designs ?',
      'Decrivez votre processus de design d une fonctionnalite.',
      'Comment creez-vous un design system ?',
    ],
    'marketing': [
      'Comment construisez-vous une strategie marketing digitale ?',
      'Quels KPIs utilisez-vous pour mesurer le succes d une campagne ?',
      'Comment gerez-vous le SEO d un site web ?',
      'Decrivez une campagne marketing dont vous etes fier(e).',
    ],
    'rh': [
      'Comment gerez-vous un processus de recrutement ?',
      'Comment detectez-vous les talents dans une candidature ?',
      'Quelle est votre approche de la gestion des conflits en entreprise ?',
      'Comment mesurez-vous l engagement des collaborateurs ?',
    ],
    'finance': [
      'Comment analysez-vous la sante financiere d une entreprise ?',
      'Expliquez les principaux ratios financiers.',
      'Comment gerez-vous les risques financiers ?',
      'Decrivez votre experience avec les outils de reporting.',
    ],
    'commerce': [
      'Comment prospectez-vous de nouveaux clients ?',
      'Decrivez votre technique de negociation.',
      'Comment gerez-vous un pipeline commercial ?',
      'Comment fidelisez-vous les clients existants ?',
    ],
    general: [
      'Decrivez un projet technique dont vous etes fier.',
      'Comment vous tenez-vous a jour dans votre domaine ?',
      'Quels outils utilisez-vous au quotidien ?',
      'Comment documentez-vous votre travail ?',
    ]
  };

  private situationalQuestions: string[] = [
    'Comment reagiriez-vous si vous etiez en desaccord avec votre manager ?',
    'Que feriez-vous si une echeance critique etait menacee ?',
    'Comment gereriez-vous un collegue qui ne fait pas sa part du travail ?',
    'Que feriez-vous si on vous demandait de faire quelque chose contraire a votre ethique ?',
    'Comment reagiriez-vous si votre idee etait rejetee par l equipe ?',
    'Decrivez comment vous gereriez un client mecontent.',
    'Que feriez-vous si vous decouvriez un bug critique en production un vendredi soir ?',
    'Comment reagiriez-vous face a un changement soudain de priorites ?',
    'Que feriez-vous si vous deviez former un collegue sur un sujet que vous ne maitrisez que partiellement ?',
    'Comment gereriez-vous une surcharge de travail importante ?',
  ];

  private careerQuestions: string[] = [
    'Parlez d un projet academique ou professionnel marquant.',
    'Qu est-ce qui vous a attire vers ce domaine ?',
    'Comment votre formation vous prepare-t-elle a ce poste ?',
    'Quelles competences souhaitez-vous developper ?',
    'Quels sont vos objectifs de carriere a court et long terme ?',
    'Parlez-moi de votre premier emploi ou stage.',
    'Quel est le feedback le plus utile que vous ayez recu ?',
    'Comment choisissez-vous les opportunites professionnelles ?',
  ];

  private englishQuestions: string[] = [
    'Tell me about yourself and your background.',
    'Why are you interested in this position?',
    'What are your greatest strengths and weaknesses?',
    'Describe a challenging project you worked on.',
    'Where do you see yourself in five years?',
    'How do you handle pressure and tight deadlines?',
    'Tell me about a time you demonstrated leadership.',
    'What makes you the best candidate for this role?',
    'How do you stay current with industry trends?',
    'Describe your ideal work environment.',
    'Tell me about a time you failed and what you learned.',
    'How do you prioritize your tasks?',
  ];

  getQuestionCount(duration: number): number {
    if (duration <= 15) return 6;
    if (duration <= 30) return 10;
    return 16;
  }

  generateQuestion(interviewType: string, difficulty: string, prev?: InterviewQuestion, jobType?: string, level?: string): InterviewQuestion {
    let text = '';
    let type: InterviewQuestion['type'] = 'behavioral';
    let category = 'Comportementale';

    if (interviewType === 'english') {
      text = this.pickRandom(this.englishQuestions, prev?.text);
      type = 'behavioral';
      category = 'English Interview';
    } else if (interviewType === 'rh') {
      const pool = this.getBehavioralPool(level);
      text = this.pickRandom(pool, prev?.text);
      type = Math.random() > 0.7 ? 'career' : 'behavioral';
      category = type === 'career' ? 'Parcours' : 'Comportementale';
    } else if (interviewType === 'tech') {
      const techPool = this.getTechnicalPool(jobType);
      text = this.pickRandom(techPool, prev?.text);
      type = 'technical';
      category = 'Technique';
    } else {
      const r = Math.random();
      if (r < 0.35) {
        text = this.pickRandom(this.getBehavioralPool(level), prev?.text);
        type = 'behavioral';
        category = 'Comportementale';
      } else if (r < 0.7) {
        text = this.pickRandom(this.getTechnicalPool(jobType), prev?.text);
        type = 'technical';
        category = 'Technique';
      } else if (r < 0.85) {
        text = this.pickRandom(this.situationalQuestions, prev?.text);
        type = 'situational';
        category = 'Mise en situation';
      } else {
        text = this.pickRandom(this.careerQuestions, prev?.text);
        type = 'career';
        category = 'Parcours';
      }
    }

    if (difficulty === 'difficile' && type !== 'technical') {
      text = this.makeDifficult(text);
    }

    return { id: this.questionId++, text, type, category };
  }

  generateAllQuestions(interviewType: string, difficulty: string, count: number, jobType?: string, level?: string): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    const usedTexts = new Set<string>();

    for (let i = 0; i < count; i++) {
      let q: InterviewQuestion;
      let attempts = 0;
      do {
        q = this.generateQuestion(interviewType, difficulty, questions[questions.length - 1], jobType, level);
        attempts++;
      } while (usedTexts.has(q.text) && attempts < 20);
      usedTexts.add(q.text);
      questions.push(q);
    }
    return questions;
  }

  private getBehavioralPool(level?: string): string[] {
    const general = [...this.behavioralQuestions['general']];
    if (level === 'stage' || level === 'alternance') {
      return [...general, ...this.behavioralQuestions['stage']];
    }
    if (level === 'senior') {
      return [...general, ...this.behavioralQuestions['senior']];
    }
    return general;
  }

  private getTechnicalPool(jobType?: string): string[] {
    const jt = (jobType || '').toLowerCase();
    const general = [...(this.technicalQuestions['general'] || [])];

    if (jt.includes('backend')) return [...(this.technicalQuestions['dev-backend'] || []), ...general];
    if (jt.includes('frontend')) return [...(this.technicalQuestions['dev-frontend'] || []), ...general];
    if (jt.includes('fullstack') || jt.includes('full-stack')) return [...(this.technicalQuestions['dev-fullstack'] || []), ...general];
    if (jt.includes('mobile')) return [...(this.technicalQuestions['dev-mobile'] || []), ...general];
    if (jt.includes('data')) return [...(this.technicalQuestions['data'] || []), ...general];
    if (jt.includes('chef') || jt.includes('pm') || jt.includes('projet')) return [...(this.technicalQuestions['pm'] || []), ...general];
    if (jt.includes('design') || jt.includes('ux') || jt.includes('ui')) return [...(this.technicalQuestions['design'] || []), ...general];
    if (jt.includes('marketing') || jt.includes('communication')) return [...(this.technicalQuestions['marketing'] || []), ...general];
    if (jt.includes('rh') || jt.includes('ressources')) return [...(this.technicalQuestions['rh'] || []), ...general];
    if (jt.includes('finance') || jt.includes('comptabilit')) return [...(this.technicalQuestions['finance'] || []), ...general];
    if (jt.includes('commerce') || jt.includes('vente')) return [...(this.technicalQuestions['commerce'] || []), ...general];

    const all: string[] = [];
    Object.values(this.technicalQuestions).forEach(arr => all.push(...arr));
    return all;
  }

  private pickRandom(arr: string[], exclude?: string): string {
    const filtered = exclude ? arr.filter(q => q !== exclude) : arr;
    return filtered[Math.floor(Math.random() * filtered.length)] || arr[0];
  }

  private makeDifficult(question: string): string {
    const prefixes = [
      'Donnez-moi un exemple concret et detaille : ',
      'En 2 minutes maximum, repondez avec la methode STAR : ',
      'Soyez tres precis et donnez des chiffres si possible : ',
    ];
    return prefixes[Math.floor(Math.random() * prefixes.length)] + question;
  }

  evaluateAnswer(question: InterviewQuestion, answer: string): QuestionFeedback {
    const trimmed = answer.trim();
    const wordCount = trimmed.split(/\s+/).filter(w => w.length > 0).length;

    const lenScore = Math.min(1, wordCount / 80);

    const starPatterns = [/situation/i, /tache|task|objectif/i, /action/i, /resultat|result|impact/i];
    const starCount = starPatterns.filter(p => p.test(trimmed)).length;
    const starScore = starCount / 4;

    const techKeywords = /\b(API|SQL|HTTP|HTTPS|REST|GraphQL|algorithm|complexity|architecture|Spring|Angular|React|Node|Docker|Kubernetes|CI\/CD|Git|Scrum|Agile|microservice|cloud|AWS|Azure|TDD|OOP|SOLID|MVC|design pattern|base de donnees|framework|librairie|performance|scalabilit|securite|test unitaire)\b/gi;
    const techMatches = (trimmed.match(techKeywords) || []).length;
    const techScore = Math.min(1, techMatches / 3);

    const softKeywords = /\b(equipe|collabor|communic|motivation|leader|initiative|autonomie|adapta|creativ|problem|resoudre|organis|responsab|passion|curieux|curieuse|apprentissage|feedback|ecoute|empathie)\b/gi;
    const softMatches = (trimmed.match(softKeywords) || []).length;
    const softScore = Math.min(1, softMatches / 2);

    const hasExample = /par exemple|j ai|nous avons|dans mon|lors de|pendant|au cours de|projet|experience|stage|mission/i.test(trimmed);
    const exampleBonus = hasExample ? 0.2 : 0;

    const hasParagraphs = (trimmed.match(/\n/g) || []).length >= 1;
    const hasConnectors = /premierement|deuxiemement|d abord|ensuite|enfin|en conclusion|de plus|par ailleurs|cependant/i.test(trimmed);
    const structureBonus = (hasParagraphs ? 0.15 : 0) + (hasConnectors ? 0.15 : 0);

    const content = Math.round(Math.min(10, (lenScore * 4 + starScore * 3 + exampleBonus * 10 + (hasExample ? 2 : 0))));
    const structure = Math.round(Math.min(10, (starScore * 5 + structureBonus * 10 + lenScore * 2)));
    const technical = question.type === 'technical'
      ? Math.round(Math.min(10, techScore * 7 + lenScore * 3))
      : Math.round(Math.min(10, techScore * 3 + lenScore * 4 + (hasExample ? 3 : 0)));
    const soft = Math.round(Math.min(10, softScore * 5 + lenScore * 3 + (hasExample ? 2 : 0)));

    const weighted = content * 0.40 + structure * 0.25 + technical * 0.20 + soft * 0.15;
    const score = Math.min(10, Math.max(1, Math.round(weighted)));

    const strengths: string[] = [];
    if (wordCount >= 50) strengths.push('Reponse suffisamment detaillee et developpee');
    if (starScore >= 0.5) strengths.push('Bonne utilisation de la structure STAR');
    if (hasExample) strengths.push('Reponse illustree par un exemple concret');
    if (techScore >= 0.5 && question.type === 'technical') strengths.push('Vocabulaire technique pertinent et precis');
    if (softScore >= 0.5) strengths.push('Bonnes competences relationnelles demontrees');
    if (hasConnectors) strengths.push('Reponse bien structuree avec des connecteurs logiques');
    if (strengths.length === 0) strengths.push('Vous avez fait l effort de repondre');

    const improvements: string[] = [];
    if (wordCount < 30) improvements.push('Developpez davantage votre reponse (min. 30 mots recommandes)');
    if (starScore < 0.25) improvements.push('Utilisez la methode STAR : Situation > Tache > Action > Resultat');
    if (!hasExample) improvements.push('Illustrez avec un exemple concret de votre experience');
    if (techScore < 0.3 && question.type === 'technical') improvements.push('Mentionnez des technologies, outils ou termes techniques specifiques');
    if (softScore < 0.3) improvements.push('Montrez vos qualites relationnelles (travail d equipe, communication)');
    if (!hasConnectors && wordCount >= 30) improvements.push('Structurez mieux avec des connecteurs (d abord, ensuite, enfin)');

    const suggestion = this.generateSuggestion(question);
    const tips = this.generateTips(question, improvements);

    return {
      questionId: question.id,
      questionText: question.text,
      answerText: trimmed,
      score,
      details: { content, structure, technical, soft },
      strengths: strengths.slice(0, 3),
      improvements: improvements.slice(0, 3),
      suggestion,
      tips
    };
  }

  private generateSuggestion(question: InterviewQuestion): string {
    if (question.type === 'technical') {
      return 'Commencez par definir le concept, expliquez votre experience pratique avec un exemple concret, mentionnez les outils/technologies utilises, et concluez par les resultats obtenus (chiffres si possible).';
    }
    if (question.type === 'situational') {
      return 'Decrivez la situation specifique, expliquez votre analyse du probleme, detaillez les actions que vous avez prises (ou prendriez), et presentez le resultat positif obtenu.';
    }
    if (question.type === 'career') {
      return 'Presentez votre parcours de facon chronologique et coherente, reliez chaque experience au poste vise, et montrez votre progression et vos motivations.';
    }
    return 'Structurez votre reponse avec la methode STAR (Situation, Tache, Action, Resultat). Donnez un exemple concret et precis, et concluez par ce que vous en avez appris.';
  }

  private generateTips(question: InterviewQuestion, _improvements: string[]): string[] {
    const tips: string[] = [];
    if (question.type === 'behavioral') {
      tips.push('Preparez 3-4 anecdotes cles que vous pouvez adapter a differentes questions');
      tips.push('Quantifiez vos resultats quand c est possible (%, chiffres, delais)');
    }
    if (question.type === 'technical') {
      tips.push('Montrez que vous comprenez le "pourquoi" derriere les choix techniques');
      tips.push('Mentionnez les compromis (trade-offs) dans vos decisions techniques');
    }
    if (question.type === 'situational') {
      tips.push('Restez positif meme en decrivant des situations difficiles');
      tips.push('Montrez votre capacite de resolution de problemes etape par etape');
    }
    tips.push('Entrainez-vous a repondre a voix haute pour gagner en naturel');
    return tips.slice(0, 3);
  }

  computeOverallScore(feedbacks: QuestionFeedback[]): number {
    if (!feedbacks.length) return 0;
    const avg = feedbacks.reduce((sum, f) => sum + f.score, 0) / feedbacks.length;
    return Math.round(avg * 10);
  }

  computeCategoryScores(feedbacks: QuestionFeedback[]): { content: number; structure: number; technical: number; soft: number } {
    if (!feedbacks.length) return { content: 0, structure: 0, technical: 0, soft: 0 };
    const n = feedbacks.length;
    return {
      content: Math.round(feedbacks.reduce((s, f) => s + f.details.content, 0) / n * 10),
      structure: Math.round(feedbacks.reduce((s, f) => s + f.details.structure, 0) / n * 10),
      technical: Math.round(feedbacks.reduce((s, f) => s + f.details.technical, 0) / n * 10),
      soft: Math.round(feedbacks.reduce((s, f) => s + f.details.soft, 0) / n * 10),
    };
  }

  getBadgeLevel(score: number): string {
    if (score >= 90) return 'Expert';
    if (score >= 75) return 'Avance';
    if (score >= 50) return 'Intermediaire';
    return 'Debutant';
  }

  saveSession(session: InterviewSession) {
    const all = this.getHistory();
    all.unshift(session);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  getHistory(): InterviewSession[] {
    try {
      const s = localStorage.getItem(this.STORAGE_KEY);
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }

  clearHistory() {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  computeBadges(history: InterviewSession[]): Record<string, boolean> {
    const badges: Record<string, boolean> = {};
    badges['firstSimulation'] = history.length >= 1;
    badges['improving'] = this.hasImproved(history, 20);
    badges['perseverant'] = history.length >= 10;

    const byJob: Record<string, InterviewSession[]> = {};
    history.forEach(h => { byJob[h.jobType] = byJob[h.jobType] || []; byJob[h.jobType].push(h); });
    badges['expert'] = Object.values(byJob).some(arr => arr.filter(s => (s.overallScore || 0) >= 90).length >= 3);

    badges['perfectScore'] = history.some(s => (s.overallScore || 0) >= 100);

    badges['communicator'] = history.some(s =>
      s.feedback.length >= 5 &&
      s.feedback.filter(f => f.details.structure >= 7).length / s.feedback.length >= 0.8
    );

    badges['speedRunner'] = history.some(s => (s.totalTime || Infinity) < 600);
    badges['polyglot'] = history.some(s => s.interviewType === 'english');

    return badges;
  }

  private hasImproved(history: InterviewSession[], percent: number): boolean {
    if (history.length < 2) return false;
    const sorted = [...history].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].overallScore || 0;
      const curr = sorted[i].overallScore || 0;
      if (prev > 0 && curr > prev && ((curr - prev) / prev) * 100 >= percent) return true;
    }
    return false;
  }
}
