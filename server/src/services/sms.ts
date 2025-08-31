import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// For development/testing, use mock credentials if not provided or if using test credentials
const isProduction = process.env.NODE_ENV === 'production';
const mockCredentials = !accountSid || !authToken || !fromNumber ||
  accountSid?.startsWith('AC_test') || accountSid === 'test_account_sid';

if (isProduction && mockCredentials) {
  throw new Error('Twilio credentials not configured for production');
}

// Create client only if we have valid credentials
const client = mockCredentials ? null : twilio(accountSid!, authToken!);

export interface SMSVerificationResult {
  success: boolean;
  error?: string;
}

export class SMSService {
  /**
   * Send verification code to phone number
   */
  static async sendVerificationCode(phoneNumber: string, code: string): Promise<SMSVerificationResult> {
    try {
      // Format phone number to E.164 if not already
      const formattedNumber = this.formatPhoneNumber(phoneNumber);

      // If using mock credentials, simulate successful SMS sending
      if (mockCredentials || !client) {
        console.log(`[MOCK SMS] 📱 Code sent to ${formattedNumber}: ${code}`);
        console.log(`[TESTING] 💡 Use verification code: ${code} in the app`);
        // Simulate occasional failures for testing (reduced for easier testing)
        if (Math.random() < 0.05) { // 5% failure rate
          return {
            success: false,
            error: 'Mock SMS service temporarily unavailable'
          };
        }
        return { success: true };
      }

      const message = await client.messages.create({
        body: `Your CampusCheers verification code is: ${code}. This code expires in 10 minutes.`,
        from: fromNumber!,
        to: formattedNumber,
      });

      console.log(`SMS sent successfully: ${message.sid}`);
      return { success: true };
    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send SMS'
      };
    }
  }

  /**
   * Generate a 6-digit verification code
   */
  static generateVerificationCode(): string {
    // For development/testing, use a fixed code for easier testing
    if (mockCredentials) {
      return '123456'; // Fixed test code
    }

    // Production: Generate random code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Format phone number to E.164 standard
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');

    // If it starts with 1 and has 11 digits, it's already in correct format
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }

    // If it has 10 digits, assume US number and add +1
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }

    // If it already has + prefix, return as is
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }

    // Default to adding +1 for US numbers
    return `+1${digitsOnly}`;
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phoneNumber: string): boolean {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  }
}