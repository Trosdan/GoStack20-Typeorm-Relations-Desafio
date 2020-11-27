import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) throw new AppError('Customer not exist', 400);

    const productsId = products.map(product => ({ id: product.id }));

    const allProducts = await this.productsRepository.findAllById(productsId);

    if (allProducts.length <= 0)
      throw new AppError('Do not have any product', 400);

    const orderProducts = allProducts.map(product => {
      const prod = products.find(produc => produc.id === product.id);

      if (!prod) throw new AppError('Product not exist', 400);

      if (product.quantity < prod.quantity)
        throw new AppError('Product with insufficient quantity', 400);

      return {
        product_id: product.id,
        quantity: prod.quantity,
        price: product.price,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(products);

    return order;
  }
}

export default CreateOrderService;
