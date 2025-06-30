import { NextResponse } from 'next/server';
import { validateTelegramAuth } from '@/lib/telegram/auth';
import { cookies } from 'next/headers';
import { UserService } from '@/lib/github/services/UserService';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const authData = {
      id: Number(url.searchParams.get('id')),
      first_name: url.searchParams.get('first_name') || '',
      last_name: url.searchParams.get('last_name') || '',
      username: url.searchParams.get('username') || '',
      photo_url: url.searchParams.get('photo_url') || '',
      auth_date: Number(url.searchParams.get('auth_date')),
      hash: url.searchParams.get('hash') || ''
    };

    // Проверяем подпись
    if (!validateTelegramAuth(authData)) {
      return NextResponse.json(
        { error: 'Invalid authentication data' },
        { status: 403 }
      );
    }

    // Создаем или обновляем пользователя
    const userService = new UserService();
    const user = await userService.createOrUpdateUser({
      id: authData.id.toString(),
      name: `${authData.first_name} ${authData.last_name}`.trim(),
      username: authData.username || authData.first_name,
      avatar: authData.photo_url,
      type: 'user'
    });

    // Устанавливаем куки
    const cookieStore = cookies();
    cookieStore.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 дней
    });

    // Редиректим на главную
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Telegram auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 