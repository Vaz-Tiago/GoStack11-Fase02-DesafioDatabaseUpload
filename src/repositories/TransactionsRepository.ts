import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    let income = 0;
    let outcome = 0;

    const transactions = await this.find();
    transactions.forEach(item => {
      if (item.type === 'income') {
        income += item.value;
      } else {
        outcome += item.value;
      }
    });

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  public async getCategory(category: string): Promise<string> {
    const categoryRepository = getRepository(Category);
    const findCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (findCategory) {
      return findCategory.id;
    }

    const newCategory = categoryRepository.create({ title: category });
    await categoryRepository.save(newCategory);
    return newCategory.id;
  }
}

export default TransactionsRepository;
