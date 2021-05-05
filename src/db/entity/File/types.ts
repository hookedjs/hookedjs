import type { BaseEntityType } from '../BaseEntityTypes'
import type { UserType } from '../types'

export interface FileType extends BaseEntityType {
  createdById: string
  createdBy: UserType
  name: string
  type: string
  size: number
  md5: string
}

export type FileCreateOptional = Pick<FileType, 'id' | 'createdById' | 'createdBy'>
export type FileCreateRequired = Pick<FileType, 'name' | 'type' | 'size' | 'md5'>
export type FileCreate = FileCreateRequired & Partial<FileCreateOptional>
export type FileUpdate = Partial<FileCreate>