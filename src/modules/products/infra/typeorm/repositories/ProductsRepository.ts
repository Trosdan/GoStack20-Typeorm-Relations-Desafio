import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ where: { name } });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const allProducts = await this.ormRepository.find({
      where: [...products],
    });

    return allProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => ({
      id: product.id,
    }));

    const allProducts = await this.ormRepository.find({
      where: [...productsId],
    });
    console.log(allProducts, products);

    allProducts.forEach((product, index) => {
      const auxProduct = products.find(prod => prod.id === product.id);

      if (!auxProduct) return;

      allProducts[index].quantity -= auxProduct.quantity;
    });

    await this.ormRepository.save(allProducts);

    return allProducts;
  }
}

export default ProductsRepository;
