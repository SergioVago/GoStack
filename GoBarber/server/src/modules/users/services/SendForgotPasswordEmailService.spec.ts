import FakeMailProvider from '@shared/container/MailProvider/fakes/FakeMailProvider';
import AppError from '@shared/errors/AppError';

import FakeUsersRepository from '../repositories/fakes/FakeUsersRepository';
import FakeUserTokensRepository from '../repositories/fakes/FakeUserTokensRepository';
import SendForgotPasswordEmailService from './SendForgotPasswordEmailService';

let fakeUsersRepository: FakeUsersRepository;
let fakeMailProvider: FakeMailProvider;
let fakeUserTokensRepository: FakeUserTokensRepository;
let sendForgotPasswordEmail: SendForgotPasswordEmailService;

describe('SendForgotPasswordEmail', () => {
  beforeEach(() => {
    fakeUsersRepository = new FakeUsersRepository();
    fakeMailProvider = new FakeMailProvider();
    fakeUserTokensRepository = new FakeUserTokensRepository();

    sendForgotPasswordEmail = new SendForgotPasswordEmailService(
      fakeUsersRepository,
      fakeMailProvider,
      fakeUserTokensRepository,
    );
  });

  it('should be able to recovery the password using the email', async () => {
    const sendMail = jest.spyOn(fakeMailProvider, 'sendMail');

    await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'jdoe@example.com',
      password: '123',
    });

    await sendForgotPasswordEmail.execute({
      email: 'jdoe@example.com',
    });

    expect(sendMail).toHaveBeenCalled();
  });

  it('should not be able to recovery a non-existing user password', async () => {
    await expect(
      sendForgotPasswordEmail.execute({
        email: 'jdoe@example.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should generate a forgot password token', async () => {
    const generateToken = jest.spyOn(fakeUserTokensRepository, 'generate');

    const user = await fakeUsersRepository.create({
      name: 'John Doe',
      email: 'jdoe@example.com',
      password: '123',
    });

    await sendForgotPasswordEmail.execute({
      email: 'jdoe@example.com',
    });

    expect(generateToken).toHaveBeenCalledWith(user.id);
  });
});
