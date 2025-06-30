import { NextResponse } from 'next/server'
import { initializeDatabase, checkDatabaseExists } from '@/src/lib/github'
import { initDatabase } from '@/src/lib/github/initDatabase'

export async function POST(request: Request) {
  try {
    // Проверяем, существует ли уже база данных
    const exists = await checkDatabaseExists()
    if (exists) {
      return NextResponse.json(
        { error: 'Database already initialized' },
        { status: 400 }
      )
    }

    // Инициализируем базу данных
    await initDatabase()

    return NextResponse.json(
      { message: 'Database initialized successfully' },
      { status: 200 }
    )
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