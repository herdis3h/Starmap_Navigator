import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// const API_SECRET = process.env.NEXT_API_SECRET

export async function GET(req: NextRequest) {
  // Authorization check removed

  // const filePath = path.join(process.cwd(), 'app/api/interstellar_destinations/data.json')
  // const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  const filePath = path.join(process.cwd(), 'public', 'data', 'interstellar_destinations.json')
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  return NextResponse.json(jsonData)
}
