import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transiction = transactionRepository.findOne(id);
    if (!transiction) {
      throw new AppError('Transition not found');
    }
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
