import { describe, expect, it } from 'vitest'
import { RegisterUseCase } from './register'
import { compare } from 'bcryptjs'
import { InMemoryUsersRepository } from '@/repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

describe('Register Use Case', () => {
  it('should be able to register', async () => {
    const UsersRepository = new InMemoryUsersRepository()
    const registerUserCase = new RegisterUseCase(UsersRepository)

    const { user } = await registerUserCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(user.id).toEqual(expect.any(String))
  })

  it('should hash user password upon registration', async () => {
    const UsersRepository = new InMemoryUsersRepository()
    const registerUserCase = new RegisterUseCase(UsersRepository)

    const { user } = await registerUserCase.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const isPasswordCorrectLyHashed = await compare(
      '123456',
      user.password_hash,
    )

    expect(isPasswordCorrectLyHashed).toBe(true)
  })

  it('should not be able to register with same email twice', async () => {
    const UsersRepository = new InMemoryUsersRepository()
    const registerUserCase = new RegisterUseCase(UsersRepository)

    const email = 'johndoe@example.com'

    await registerUserCase.execute({
      name: 'John Doe',
      email,
      password: '123456',
    })

    expect(() =>
      registerUserCase.execute({
        name: 'John Doe',
        email,
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UserAlreadyExistsError)
  })
})
