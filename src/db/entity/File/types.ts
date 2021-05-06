import type { BaseEntityType } from '../base/BaseEntityTypes'
import type { UserType } from '../types'

export interface FileType extends BaseEntityType {
  createdById: string
  createdBy: UserType
  name: string
  type: string
  size: number
  md5: string
  bin?: string
}

export type FileCreateOptional = Pick<FileType, 'id' | 'createdById' | 'createdBy' | 'bin'>
export type FileCreateRequired = Pick<FileType, 'name' | 'type' | 'size' | 'md5'>
export type FileCreate = FileCreateRequired & Partial<FileCreateOptional>
export type FileUpdate = Partial<FileCreate>