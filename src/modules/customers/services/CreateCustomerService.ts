import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const isEmailExist = await this.customersRepository.findByEmail(email);

    if (isEmailExist) throw new AppError('Email already exist');

    const customer = await this.customersRepository.create({
      email,
      name,
    });

    console.log(customer);

    return customer;
  }
}

export default CreateCustomerService;
