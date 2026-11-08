import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AiInterviewService,
  InterviewQuestion,
  InterviewSession,
  QuestionFeedback
} from './ai-interview.service';

type ViewState = 'config' | 'interview' | 'results';

@Component({
  selector: 'app-ai-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ai-simulator.component.html',
  styleUrls: ['./ai-simulator.component.css']
})
export class AiSimulatorComponent implements OnInit, OnDestroy {

  view: ViewState = 'config';

  /* ── CONFIG ── */
  config = {
    jobType: '',
    level: '',
    sector: '',
    interviewType: 'rh',
    duration: 30,
    difficulty: 'moyen'
  };

  jobTypes = [
    { value: 'dev-fullstack', label: 'Developpeur Full Stack' },
    { value: 'dev-backend', label: 'Developpeur Backend' },
    { value: 'dev-frontend', label: 'Developpeur Frontend' },
    { value: 'dev-mobile', label: 'Developpeur Mobile' },
    { value: 'data', label: 'Data Scientist / Analyst' },
    { value: 'pm', label: 'Chef de Projet / PM' },
    { value: 'design', label: 'UX/UI Designer' },
    { value: 'marketing', label: 'Marketing Digital' },
    { value: 'commerce', label: 'Commercial / Vente' },
    { value: 'finance', label: 'Finance / Comptabilite' },
    { value: 'rh', label: 'Ressources Humaines' },
    { value: 'other', label: 'Autre' }
  ];

  levels = [
    { value: 'stage', label: 'Stage' },
    { value: 'alternance', label: 'Alternance' },
    { value: 'junior', label: 'Junior (0-2 ans)' },
    { value: 'mid', label: 'Confirme (2-5 ans)' },
    { value: 'senior', label: 'Senior (5+ ans)' }
  ];

  sectors = [
    { value: 'tech', label: 'Tech / IT' },
    { value: 'finance', label: 'Finance / Banque' },
    { value: 'sante', label: 'Sante / Pharma' },
    { value: 'industrie', label: 'Industrie' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'ecommerce', label: 'E-commerce / Retail' },
    { value: 'education', label: 'Education' },
    { value: 'startup', label: 'Startup' },
    { value: 'other', label: 'Autre' }
  ];

  /* ── STATS ── */
  stats = { simulations: 0, average: 0, progress: 0 };

  badges = [
    { icon: '\u{1F3AF}', name: '1ere simulation', key: 'firstSimulation', locked: true },
    { icon: '\u{1F4C8}', name: 'En progression', key: 'improving', locked: true },
    { icon: '\u{1F4AA}', name: 'Perseverant', key: 'perseverant', locked: true },
    { icon: '\u{1F3C6}', name: 'Expert', key: 'expert', locked: true },
    { icon: '\u{2B50}', name: 'Score Parfait', key: 'perfectScore', locked: true },
    { icon: '\u{1F5E3}', name: 'Communicant', key: 'communicator', locked: true },
    { icon: '\u{26A1}', name: 'Speed Runner', key: 'speedRunner', locked: true },
    { icon: '\u{1F30D}', name: 'Polyglotte', key: 'polyglot', locked: true }
  ];

  /* ── INTERVIEW STATE ── */
  currentSession: InterviewSession | null = null;
  questions: InterviewQuestion[] = [];
  currentQuestionIndex = 0;
  currentAnswer = '';
  isSubmitting = false;
  feedbacks: QuestionFeedback[] = [];
  answers: string[] = [];

  /* Timer */
  timerDisplay = '00:00';
  elapsedSeconds = 0;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  /* AI typing animation */
  isAiTyping = false;
  aiMessage = '';

  /* ── RESULTS STATE ── */
  overallScore = 0;
  categoryScores = { content: 0, structure: 0, technical: 0, soft: 0 };
  badgeLevel = '';
  expandedFeedback: number | null = null;

  /* Config validation */
  configError = '';

  constructor(private interviewService: AiInterviewService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  /* ── STATS LOADING ── */
  loadStats(): void {
    const history = this.interviewService.getHistory();
    this.stats.simulations = history.length;
    if (history.length > 0) {
      this.stats.average = Math.round(
        history.reduce((s, h) => s + (h.overallScore || 0), 0) / history.length
      );
    }

    const badgeMap = this.interviewService.computeBadges(history);
    this.stats.progress = Object.values(badgeMap).filter(v => v).length;
    this.badges.forEach(b => {
      b.locked = !badgeMap[b.key];
    });
  }

  /* ── CONFIG VALIDATION & START ── */
  get configValid(): boolean {
    return !!this.config.jobType && !!this.config.level;
  }

  startSimulation(): void {
    if (!this.configValid) {
      this.configError = 'Veuillez selectionner un poste et un niveau.';
      return;
    }
    this.configError = '';

    const duration = Number(this.config.duration);
    const questionCount = this.interviewService.getQuestionCount(duration);

    this.questions = this.interviewService.generateAllQuestions(
      this.config.interviewType,
      this.config.difficulty,
      questionCount,
      this.config.jobType,
      this.config.level
    );

    this.currentSession = {
      id: 'session_' + Date.now(),
      jobType: this.config.jobType,
      level: this.config.level,
      sector: this.config.sector || 'general',
      interviewType: this.config.interviewType,
      duration: String(this.config.duration),
      difficulty: this.config.difficulty,
      startedAt: new Date().toISOString(),
      questions: this.questions,
      answers: [],
      feedback: []
    };

    this.currentQuestionIndex = 0;
    this.currentAnswer = '';
    this.feedbacks = [];
    this.answers = [];
    this.elapsedSeconds = 0;
    this.expandedFeedback = null;

    this.view = 'interview';
    this.startTimer();
    this.showAiQuestion();
  }

  /* ── INTERVIEW FLOW ── */
  get currentQuestion(): InterviewQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  get progressPercent(): number {
    if (!this.questions.length) return 0;
    return Math.round((this.currentQuestionIndex / this.questions.length) * 100);
  }

  get questionsAnswered(): number {
    return this.feedbacks.length;
  }

  showAiQuestion(): void {
    this.isAiTyping = true;
    this.aiMessage = '';
    const q = this.currentQuestion;
    if (!q) return;

    setTimeout(() => {
      this.isAiTyping = false;
      this.aiMessage = q.text;
    }, 800 + Math.random() * 600);
  }

  submitAnswer(): void {
    if (!this.currentAnswer.trim() || this.isSubmitting || !this.currentQuestion) return;
    this.isSubmitting = true;

    const q = this.currentQuestion;
    const answer = this.currentAnswer.trim();

    setTimeout(() => {
      const feedback = this.interviewService.evaluateAnswer(q, answer);
      feedback.responseTime = this.elapsedSeconds;
      this.feedbacks.push(feedback);
      this.answers.push(answer);
      this.currentAnswer = '';
      this.isSubmitting = false;

      if (this.currentQuestionIndex < this.questions.length - 1) {
        this.currentQuestionIndex++;
        this.showAiQuestion();
      } else {
        this.finishInterview();
      }
    }, 500);
  }

  skipQuestion(): void {
    if (!this.currentQuestion || this.isSubmitting) return;
    const q = this.currentQuestion;

    const emptyFeedback: QuestionFeedback = {
      questionId: q.id,
      questionText: q.text,
      answerText: '(Question passee)',
      score: 0,
      details: { content: 0, structure: 0, technical: 0, soft: 0 },
      strengths: [],
      improvements: ['Vous avez passe cette question. Essayez de repondre a toutes les questions pour un meilleur score.'],
      suggestion: '',
      tips: []
    };
    this.feedbacks.push(emptyFeedback);
    this.answers.push('');

    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      this.showAiQuestion();
    } else {
      this.finishInterview();
    }
  }

  endInterviewEarly(): void {
    if (this.feedbacks.length === 0) {
      this.view = 'config';
      this.stopTimer();
      return;
    }
    this.finishInterview();
  }

  finishInterview(): void {
    this.stopTimer();

    this.overallScore = this.interviewService.computeOverallScore(this.feedbacks);
    this.categoryScores = this.interviewService.computeCategoryScores(this.feedbacks);
    this.badgeLevel = this.interviewService.getBadgeLevel(this.overallScore);

    if (this.currentSession) {
      this.currentSession.endedAt = new Date().toISOString();
      this.currentSession.totalTime = this.elapsedSeconds;
      this.currentSession.feedback = this.feedbacks;
      this.currentSession.answers = this.answers;
      this.currentSession.overallScore = this.overallScore;
      this.currentSession.categoryScores = this.categoryScores;
      this.currentSession.badge = this.badgeLevel;
      this.interviewService.saveSession(this.currentSession);
    }

    this.loadStats();
    this.view = 'results';
  }

  /* ── RESULTS ── */
  toggleFeedback(index: number): void {
    this.expandedFeedback = this.expandedFeedback === index ? null : index;
  }

  getScoreColor(score: number): string {
    if (score >= 75) return '#00B894';
    if (score >= 50) return '#FDCB6E';
    return '#E17055';
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Tres bien';
    if (score >= 50) return 'Bien';
    if (score >= 25) return 'A ameliorer';
    return 'Insuffisant';
  }

  restartSimulation(): void {
    this.view = 'config';
    this.currentSession = null;
    this.questions = [];
    this.feedbacks = [];
    this.answers = [];
    this.currentQuestionIndex = 0;
    this.currentAnswer = '';
    this.overallScore = 0;
    this.expandedFeedback = null;
  }

  retryWithSameConfig(): void {
    this.feedbacks = [];
    this.answers = [];
    this.currentQuestionIndex = 0;
    this.currentAnswer = '';
    this.overallScore = 0;
    this.expandedFeedback = null;
    this.startSimulation();
  }

  /* ── TIMER ── */
  private startTimer(): void {
    this.elapsedSeconds = 0;
    this.timerDisplay = '00:00';
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      const m = Math.floor(this.elapsedSeconds / 60);
      const s = this.elapsedSeconds % 60;
      this.timerDisplay = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /* ── HELPERS ── */
  getJobLabel(value: string): string {
    return this.jobTypes.find(j => j.value === value)?.label || value;
  }

  getLevelLabel(value: string): string {
    return this.levels.find(l => l.value === value)?.label || value;
  }

  getInterviewTypeLabel(value: string): string {
    const map: Record<string, string> = {
      rh: 'Entretien RH',
      tech: 'Entretien Technique',
      mixte: 'Entretien Mixte',
      english: 'English Interview'
    };
    return map[value] || value;
  }
}
