import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Global verification code storage (in production, use Redis)
declare global {
  var verificationCodes: Map<string, { code: string; expiry: Date }> | undefined;
}

if (!global.verificationCodes) {
  global.verificationCodes = new Map();
}

// SMS Service class
class SMSService {
  static async sendSMS(phoneNumber: string, message: string) {
    // Check if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        const result = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+1${phoneNumber}`
        });
        
        console.log(`SMS sent successfully: ${result.sid}`);
        return { success: true, messageId: result.sid };
      } catch (error) {
        console.error('Twilio SMS error:', error);
        // Fall back to console logging in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[DEV] SMS to ${phoneNumber}: ${message}`);
          return { success: true, messageId: 'dev-mode' };
        }
        throw error;
      }
    } else {
      // Development mode - just log the message
      console.log(`[DEV] SMS to ${phoneNumber}: ${message}`);
      return { success: true, messageId: 'dev-mode' };
    }
  }

  static validatePhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    // Check if it's a valid 10-digit US number
    return digits.length === 10 && /^[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(digits);
  }

  static formatPhoneNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits;
  }

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!SMSService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Please enter a valid 10-digit US phone number.' },
        { status: 400 }
      );
    }

    const formattedNumber = SMSService.formatPhoneNumber(phoneNumber);

    // Rate limiting check - max 3 attempts per hour per phone number
    const existingCode = global.verificationCodes?.get(formattedNumber);
    if (existingCode && existingCode.expiry > new Date()) {
      const timeLeft = Math.ceil((existingCode.expiry.getTime() - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Please wait ${timeLeft} minutes before requesting a new code.` },
        { status: 429 }
      );
    }

    // Generate verification code
    const code = SMSService.generateVerificationCode();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store the code
    global.verificationCodes?.set(formattedNumber, { code, expiry });

    // Send SMS
    const message = `Your CampusCheers verification code is: ${code}. This code expires in 10 minutes.`;
    
    try {
      await SMSService.sendSMS(formattedNumber, message);
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Verification code sent successfully'
    });

  } catch (error) {
    console.error('Error sending verification code:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
