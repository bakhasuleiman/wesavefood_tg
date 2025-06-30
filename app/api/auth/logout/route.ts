import { NextResponse } from 'next/server'
import { AuthResponse } from '@/types'

export async function POST() {
  const response = NextResponse.json<AuthResponse>({
    success: true,
    message: 'Успешный выход'
  })

  // Удаляем cookie с токеном
  response.cookies.delete('auth_token')

  return response
} 