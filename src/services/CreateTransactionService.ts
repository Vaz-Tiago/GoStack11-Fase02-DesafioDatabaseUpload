import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface CreateTransaction {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: CreateTransaction): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('The field type is incompatible');
    }

    const balance = await transactionRepository.getBalance();
    if (type === 'outcome' && balance.total < value) {
      throw new AppError('The value is bigger than your balance');
    }

    const category_id = await transactionRepository.getCategory(category);

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
