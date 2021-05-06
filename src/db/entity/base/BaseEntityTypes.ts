export interface BaseEntityType {
  id: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  version: number
}
