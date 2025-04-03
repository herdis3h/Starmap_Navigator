import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// const API_SECRET = process.env.NEXT_API_SECRET

export async function GET(req: NextRequest) {
  // const authHeader = req.headers.get('Authorization')
  // if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }

  const filePath = path.join(process.cwd(), 'app/api/interstellar_destinations/data.json')
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  return NextResponse.json(jsonData)
}
