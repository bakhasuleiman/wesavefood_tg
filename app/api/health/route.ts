import { NextResponse } from 'next/server';
import { database } from '@/src/lib/github/database';

export async function GET() {
  try {
    // Проверяем подключение к GitHub
    await database.get('health');
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 