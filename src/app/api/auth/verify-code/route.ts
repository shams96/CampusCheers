import { NextRequest, NextResponse } from 'next/server';

// Use the same global verification code storage
declare global {
  var verificationCodes: Map<string, { code: string; expiry: Date }> | undefined;
}

if (!global.verificationCodes) {
  global.verificationCodes = new Map();
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      );
    }

    // Format phone number (remove all non-digits)
    const formattedNumber = phoneNumber.replace(/\D/g, '');

    const storedData = global.verificationCodes?.get(formattedNumber);

    if (!storedData) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date() > storedData.expiry) {
      global.verificationCodes?.delete(formattedNumber);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (storedData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Code is valid, remove it from storage
    global.verificationCodes?.delete(formattedNumber);

    return NextResponse.json({ 
      success: true,
      message: 'Phone number verified successfully'
    });
  } catch (error) {
    console.error('Error verifying code:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
