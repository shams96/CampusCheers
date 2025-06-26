import { User, School, DailyPoll, PollResponse, PollResults } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock database storage
class MockDatabase {
  private users: Map<string, User> = new Map();
  private schools: Map<string, School> = new Map();
  private dailyPolls: Map<string, DailyPoll> = new Map();
  private responses: Map<string, PollResponse> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize schools
    const schools: School[] = [
      {
        school_id: uuidv4(),
        name: "Plano Senior High School",
        district: "Plano ISD",
        state: "Texas"
      },
      {
        school_id: uuidv4(),
        name: "Allen High School",
        district: "Allen ISD",
        state: "Texas"
      },
      {
        school_id: uuidv4(),
        name: "McKinney High School",
        district: "McKinney ISD",
        state: "Texas"
      }
    ];

    schools.forEach(school => {
      this.schools.set(school.school_id, school);
    });

    // Initialize today's polls
    const today = new Date();
    const pollTemplates = [
      {
        question: "Who has the most contagious laugh on campus?",
        options: ["The one who snorts when they laugh", "The silent giggler", "The belly laugher", "The one who laughs at everything"]
      },
      {
        question: "Which classmate would you want on your team for any challenge?",
        options: ["The problem solver", "The cheerleader", "The creative one", "The organized planner"]
      },
      {
        question: "Who has the best style that makes you smile?",
        options: ["The color coordinator", "The vintage lover", "The minimalist", "The trendsetter"]
      }
    ];

    schools.forEach((school, index) => {
      const poll: DailyPoll = {
        poll_id: uuidv4(),
        school_id: school.school_id,
        question: pollTemplates[index % pollTemplates.length].question,
        options: pollTemplates[index % pollTemplates.length].options,
        scheduled_for: today,
        created_at: new Date()
      };
      this.dailyPolls.set(poll.poll_id, poll);
    });
  }

  // User operations
  async createUser(schoolEmail: string): Promise<User> {
    const user: User = {
      user_id: uuidv4(),
      school_email: schoolEmail,
      created_at: new Date()
    };
    this.users.set(user.user_id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.school_email === email) {
        return user;
      }
    }
    return null;
  }

  // School operations
  async getSchools(): Promise<School[]> {
    return Array.from(this.schools.values());
  }

  async getSchoolById(schoolId: string): Promise<School | null> {
    return this.schools.get(schoolId) || null;
  }

  // Poll operations
  async getTodaysPoll(schoolId: string): Promise<DailyPoll | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const poll of this.dailyPolls.values()) {
      const pollDate = new Date(poll.scheduled_for);
      pollDate.setHours(0, 0, 0, 0);
      
      if (poll.school_id === schoolId && pollDate.getTime() === today.getTime()) {
        return poll;
      }
    }
    return null;
  }

  async createPoll(poll: Omit<DailyPoll, 'poll_id' | 'created_at'>): Promise<DailyPoll> {
    const newPoll: DailyPoll = {
      ...poll,
      poll_id: uuidv4(),
      created_at: new Date()
    };
    this.dailyPolls.set(newPoll.poll_id, newPoll);
    return newPoll;
  }

  // Response operations
  async submitResponse(response: Omit<PollResponse, 'response_id' | 'submitted_at'>): Promise<PollResponse> {
    const newResponse: PollResponse = {
      ...response,
      response_id: uuidv4(),
      submitted_at: new Date()
    };
    this.responses.set(newResponse.response_id, newResponse);
    return newResponse;
  }

  async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    for (const response of this.responses.values()) {
      if (response.poll_id === pollId && response.responder_id === userId) {
        return true;
      }
    }
    return false;
  }

  async getPollResults(pollId: string): Promise<PollResults> {
    const poll = this.dailyPolls.get(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const responses = Array.from(this.responses.values()).filter(r => r.poll_id === pollId);
    const totalResponses = responses.length;
    
    const optionCounts: Record<string, number> = {};
    poll.options.forEach(option => {
      optionCounts[option] = 0;
    });

    responses.forEach(response => {
      optionCounts[response.chosen_option]++;
    });

    const optionPercentages: Record<string, number> = {};
    poll.options.forEach(option => {
      optionPercentages[option] = totalResponses > 0 ? (optionCounts[option] / totalResponses) * 100 : 0;
    });

    return {
      poll_id: pollId,
      total_responses: totalResponses,
      option_counts: optionCounts,
      option_percentages: optionPercentages
    };
  }

  // Daily automation helpers
  async createDailyPolls(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const pollTemplates = [
      {
        question: "Who brightens your day with their smile?",
        options: ["The morning person", "The lunch buddy", "The hallway greeter", "The class clown"]
      },
      {
        question: "Which classmate would you trust with your biggest secret?",
        options: ["The loyal friend", "The good listener", "The trustworthy one", "The supportive person"]
      },
      {
        question: "Who has the most positive energy in the room?",
        options: ["The motivator", "The encourager", "The optimist", "The cheerleader"]
      }
    ];

    const schools = await this.getSchools();
    schools.forEach((school, index) => {
      const poll: DailyPoll = {
        poll_id: uuidv4(),
        school_id: school.school_id,
        question: pollTemplates[index % pollTemplates.length].question,
        options: pollTemplates[index % pollTemplates.length].options,
        scheduled_for: tomorrow,
        created_at: new Date()
      };
      this.dailyPolls.set(poll.poll_id, poll);
    });
  }

  // Cleanup old data (30-day retention)
  async cleanupOldData(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Remove old responses
    for (const [responseId, response] of this.responses.entries()) {
      if (response.submitted_at < thirtyDaysAgo) {
        this.responses.delete(responseId);
      }
    }

    // Remove old polls
    for (const [pollId, poll] of this.dailyPolls.entries()) {
      if (poll.scheduled_for < thirtyDaysAgo) {
        this.dailyPolls.delete(pollId);
      }
    }
  }
}

// Export singleton instance
export const db = new MockDatabase(); 