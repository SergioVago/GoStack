import AuthenticateUserService from './AuthenticateUserService';
import CreateUserService from './CreateUserService';

import FakeHashProvider from '../providers/HashProvider/fakes/FakeHashProvider';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';

describe('AuthenticateUser', () => {
  it('should be able to authenticate', async () => {
    const fakeUsersRepository = new FakeUsersRepository();
    const fakeHashProvider = new FakeHashProvider();

    const createUser = new CreateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );

    const authenticateUser = new AuthenticateUserService(
      fakeUsersRepository,
      fakeHashProvider,
    );

    const user = await createUser.execute({
      name: 'John Doe',
      email: 'jdoe@example.com',
      password: '123',
    });

    const response = await authenticateUser.execute({
      email: 'jdoe@example.com',
      password: '123',
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toEqual(user);
  });
});
