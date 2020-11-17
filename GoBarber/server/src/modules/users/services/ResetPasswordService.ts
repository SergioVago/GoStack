import AppError from '@shared/errors/AppError';
import { differenceInHours } from 'date-fns';
import { inject, injectable } from 'tsyringe';

import IHashProvider from '../providers/HashProvider/models/IHashProvider';

import IUserTokensRepository from '../repositories/IUserTokensRepository';
import IUsersRepository from '../repositories/IUsersRepository';

interface IRequest {
  token: string;
  password: string;
}

@injectable()
class ResetPasswordService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('UserTokensRepository')
    private userTokensRepository: IUserTokensRepository,

    @inject('HashProvider')
    private hashProvider: IHashProvider,
  ) {}

  public async execute({ token, password }: IRequest): Promise<void> {
    const userToken = await this.userTokensRepository.findByToken(token);

    if (!userToken) {
      throw new AppError('User token does not exist');
    }

    const user = await this.usersRepository.findById(userToken.user_id);

    if (!user) {
      throw new AppError('User does not exist');
    }

    const tokenCreatedAt = userToken.created_at;

    if (differenceInHours(new Date(Date.now()), tokenCreatedAt) > 2) {
      throw new AppError('Token expired');
    }

    user.password = await this.hashProvider.generateHash(password);

    await this.usersRepository.save(user);
  }
}

export default ResetPasswordService;
