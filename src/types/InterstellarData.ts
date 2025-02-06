export interface PlanetData {
  name: string
  description: string
  image_url?: string
  color: string
}

export interface StarSystem {
  star_system: string
  star_type: string
  distance_from_earth_ly: number
  habitability: boolean
  resources: string[]
  coordinates: [number, number, number]
  color: string
  planets: PlanetData[]
}
