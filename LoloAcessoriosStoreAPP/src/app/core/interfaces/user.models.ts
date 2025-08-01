export interface CreateUserDTO {
  name: string,
  dateOfBirth: Date,
  gender: string,
  email: string,
  password: string,
  rePassword: string
}

export interface LoginDTO {
  email: string,
  password: string
}

export interface UserProfileDTO {
  name: string,
  dateOfBirth: Date,
  gender: string,
  email: string,
  isAdmin: boolean
}

export interface UpdateOwnProfileDTO {
  name: string,
  gender: string,
  email: string,
  dateOfBirth: Date,
  currentPassword?: string,
  newPassword?: string,
  rePassword?: string
}

export interface UpdateProfileDTO {
  name: string,
  gender: string,
  email: string,
  dateOfBirth: Date,
  newPassword?: string,
  rePassword?: string
}
