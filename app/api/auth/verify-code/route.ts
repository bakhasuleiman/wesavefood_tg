import { NextRequest, NextResponse } from 'next/server'
import { AuthResponse, User } from '@/types'
import { sign } from 'jsonwebtoken'
import { 
  getVerificationCode, 
  deleteVerificationCode, 
  incrementAttempts,
  cleanupExpiredCodes,
  verificationCodes
} from '@/src/utils/verificationStore'
import { userService } from '@/src/lib/github'

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    console.log('Верификация кода:', { phone, code, nodeEnv: process.env.NODE_ENV })

    // Валидация входных данных
    if (!phone || !code) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Неверные данные'
      }, { status: 400 })
    }

    // Очистка устаревших кодов
    cleanupExpiredCodes()

    // Получение данных верификации
    const verificationData = getVerificationCode(phone)
    
    console.log('Данные верификации:', {
      phone,
      code,
      verificationData,
      allCodes: Array.from(verificationCodes.entries())
    })
    
    if (!verificationData) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Код не найден. Запросите новый код.'
      }, { status: 400 })
    }

    // Проверка срока действия кода
    if (new Date() > verificationData.expiresAt) {
      console.log('Код истек:', {
        now: new Date(),
        expiresAt: verificationData.expiresAt
      })
      deleteVerificationCode(phone)
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Код истек. Запросите новый код.'
      }, { status: 400 })
    }

    // Проверка количества попыток
    if (verificationData.attempts >= 3) {
      console.log('Превышено количество попыток:', verificationData.attempts)
      deleteVerificationCode(phone)
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Превышено количество попыток. Запросите новый код.'
      }, { status: 400 })
    }

    // Увеличение счетчика попыток
    incrementAttempts(phone)

    // Проверка кода (в dev-режиме разрешаем любой код)
    const isDevMode = process.env.NODE_ENV === 'development'
    const isCodeValid = isDevMode || verificationData.code === code
    
    console.log('Проверка кода:', { 
      isDevMode, 
      expectedCode: verificationData.code, 
      providedCode: code, 
      isCodeValid,
      attempts: verificationData.attempts
    })

    if (!isCodeValid) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Неверный код'
      }, { status: 400 })
    }

    // Код верный - удаляем из временного хранилища
    deleteVerificationCode(phone)

    // Поиск или создание пользователя в базе данных
    let user: User | null = null
    const existingUser = await userService.getUserByPhone(phone)
    
    if (existingUser) {
      user = existingUser
    } else {
      // Создание нового пользователя
      const newUser: User = {
        id: `user_${Date.now()}`,
        phone,
        profileType: 'client',
        preferences: {
          categories: [],
          maxDistance: 10,
          notifications: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const success = await userService.createUser(newUser)
      if (success) {
        user = newUser
      } else {
        throw new Error('Не удалось создать пользователя')
      }
    }

    if (!user) {
      return NextResponse.json<AuthResponse>({
        success: false,
        error: 'Ошибка создания пользователя'
      }, { status: 500 })
    }

    // Генерация JWT токена
    const token = sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    console.log('Успешная верификация для пользователя:', user.id)

    // Создание ответа с HttpOnly cookie
    const response = NextResponse.json<AuthResponse>({
      success: true,
      user,
      token,
      message: 'Успешный вход'
    })

    // Установка HttpOnly cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 дней
    })

    return response

  } catch (error) {
    console.error('Ошибка верификации кода:', error)
    return NextResponse.json<AuthResponse>({
      success: false,
      error: 'Ошибка верификации. Попробуйте позже.'
    }, { status: 500 })
  }
} 