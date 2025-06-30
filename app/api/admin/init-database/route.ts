import { NextResponse } from 'next/server'
import { initDatabase } from '@/src/lib/github'

export async function POST() {
  try {
    await initDatabase()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error initializing database:', error)
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Проверяем состояние базы данных
    const exists = await checkDatabaseExists()
    
    return NextResponse.json(
      { initialized: exists },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking database status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 