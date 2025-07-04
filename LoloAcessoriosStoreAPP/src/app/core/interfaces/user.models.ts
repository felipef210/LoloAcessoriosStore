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
