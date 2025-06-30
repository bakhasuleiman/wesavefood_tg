'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Phone, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/src/contexts/AuthContext'
import { User } from '@/types'
import { Dialog } from '@headlessui/react'
import { createTelegramLoginWidget } from '../src/lib/telegram/auth'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, verifyCode, isLoading, error, clearError } = useAuth()
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [isResending, setIsResending] = useState(false)
  const telegramContainerRef = useRef<HTMLDivElement>(null)

  // Таймер для повторной отправки кода
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // Очистка формы при закрытии
  useEffect(() => {
    if (!isOpen) {
      setStep('phone')
      setPhone('')
      setCode('')
      setCodeSent(false)
      setCountdown(0)
      clearError()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && telegramContainerRef.current) {
      const widgetHtml = createTelegramLoginWidget('telegram-login')
      telegramContainerRef.current.innerHTML = widgetHtml
    }
  }, [isOpen])

  // Обработка отправки номера телефона
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim()) return

    try {
      await login(phone)
      setCodeSent(true)
      setStep('code')
      setCountdown(60) // 60 секунд до возможности повторной отправки
    } catch (error) {
      console.error('Ошибка отправки кода:', error)
    }
  }

  // Создание пользователя в базе данных
  const createUser = async (phone: string): Promise<boolean> => {
    try {
      const newUser: User = {
        id: Date.now().toString(), // Генерируем уникальный ID
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

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('Ошибка создания пользователя:', data.error)
        return false
      }

      return true
    } catch (error) {
      console.error('Ошибка создания пользователя:', error)
      return false
    }
  }

  // Обработка верификации кода
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    console.log('Отправка кода на верификацию:', { phone, code })
    
    const success = await verifyCode(phone, code)
    console.log('Результат верификации:', success)
    
    if (success) {
      console.log('Верификация успешна, закрываю модальное окно')
      onClose()
    }
    // Ошибки будут показаны через error из контекста
  }

  // Повторная отправка кода
  const handleResendCode = async () => {
    if (countdown > 0) return

    setIsResending(true)
    try {
      await login(phone)
      setCountdown(60)
    } catch (error) {
      console.error('Ошибка повторной отправки кода:', error)
    } finally {
      setIsResending(false)
    }
  }

  // Возврат к вводу номера
  const handleBackToPhone = () => {
    setStep('phone')
    setCode('')
    clearError()
  }

  // Форматирование номера телефона
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.startsWith('998')) {
      return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-center text-xl font-medium mb-4">
            Войти через Telegram
          </Dialog.Title>
          
          <div 
            ref={telegramContainerRef}
            id="telegram-login"
            className="flex justify-center"
          />

          <p className="mt-4 text-sm text-gray-500 text-center">
            Нажмите кнопку выше, чтобы войти через Telegram.<br/>
            Это безопасно и займет всего пару секунд.
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 