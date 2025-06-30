import { NextResponse } from 'next/server'
import { userService } from '@/src/lib/github'
import { User } from '@/types'

export async function GET() {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await request.json() as User
    
    // Проверяем, существует ли пользователь с таким телефоном
    const existingUser = await userService.getUserByPhone(user.phone)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this phone already exists' },
        { status: 400 }
      )
    }

    // Добавляем временные метки
    const now = new Date()
    const newUser: User = {
      ...user,
      createdAt: now,
      updatedAt: now
    }

    const success = await userService.createUser(newUser)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
} 