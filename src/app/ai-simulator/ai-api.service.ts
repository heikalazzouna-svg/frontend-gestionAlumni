import { Injectable } from '@angular/core';
import { AiInterviewService, InterviewQuestion, QuestionFeedback, InterviewSession } from './ai-interview.service';

@Injectable({ providedIn: 'root' })
export class AiApiService {
  useRemote = true;
  baseUrl = '/api/ai-interview';

  constructor(private localService: AiInterviewService) {}

  async evaluateAnswerAsync(question: InterviewQuestion, answer: string, jobType?: string): Promise<QuestionFeedback> {
    if (!this.useRemote) {
      return Promise.resolve(this.localService.evaluateAnswer(question, answer));
    }

    try {
      const resp = await fetch(`${this.baseUrl}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.text, answer, jobType })
      });
      if (!resp.ok) throw new Error('Bad response');
      const json = await resp.json();
      return json as QuestionFeedback;
    } catch {
      return this.localService.evaluateAnswer(question, answer);
    }
  }

  async generateQuestionAsync(interviewType: string, difficulty: string, prev?: InterviewQuestion, jobType?: string, level?: string): Promise<InterviewQuestion> {
    if (!this.useRemote) {
      return Promise.resolve(this.localService.generateQuestion(interviewType, difficulty, prev));
    }
    try {
      const resp = await fetch(`${this.baseUrl}/next-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewType, difficulty, prev: prev?.text, jobType, level })
      });
      const json = await resp.json();
      return json as InterviewQuestion;
    } catch {
      return this.localService.generateQuestion(interviewType, difficulty, prev);
    }
  }

  saveSession(session: InterviewSession) {
    this.localService.saveSession(session);
  }

  getHistory(): InterviewSession[] {
    return this.localService.getHistory();
  }

  computeBadges(history: InterviewSession[]): Record<string, boolean> {
    return this.localService.computeBadges(history);
  }

  clearHistory(): void {
    this.localService.clearHistory();
  }
}
