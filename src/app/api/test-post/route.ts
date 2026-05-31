import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ received: body, ok: true })
}

export async function GET() {
  return NextResponse.json({ method: 'GET', ok: true })
}
