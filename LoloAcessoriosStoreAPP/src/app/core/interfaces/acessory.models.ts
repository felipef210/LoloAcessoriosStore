export interface AcessoryDTO {
  name: string,
  price: number,
  description: string,
  category: string,
  pictures: string[],
  lastUpdate: Date
}

export interface CreateAcessoryDTO {
  name: string,
  price: number,
  description: string,
  category: string,
  pictures?: File[],
  lastUpdate: Date
}

export interface FilterAcessoryDTO {
  name?: string,
  orderBy?: string,
  category: string,
  page: number,
  recordsPerPage: number
}
