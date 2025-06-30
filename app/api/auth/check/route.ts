import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'
import { AuthResponse } from '@/types'
import { userService } from '@/src/lib/github'

export async function GET(request: NextRequest) {
  try {
    // Получаем токен из cookie
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Не авторизован'
      }, { status: 401 })
    }

    // Проверяем токен
    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }
    
    // Получаем пользователя из базы данных
    const user = await userService.getUserById(decoded.userId)

    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Пользователь не найден'
      }, { status: 404 })
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      user
    })

  } catch (error) {
    console.error('Ошибка проверки аутентификации:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Ошибка проверки аутентификации'
    }, { status: 401 })
  }
} 