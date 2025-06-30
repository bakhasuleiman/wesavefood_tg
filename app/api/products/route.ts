import { NextResponse } from 'next/server'
import { productService } from '@/src/lib/github'
import { Product } from '@/types'

export async function GET() {
  try {
    const products = await productService.getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json() as Product
    
    // Добавляем временные метки
    const now = new Date()
    const newProduct: Product = {
      ...product,
      createdAt: now,
      updatedAt: now
    }

    const success = await productService.createProduct(newProduct)
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
} 