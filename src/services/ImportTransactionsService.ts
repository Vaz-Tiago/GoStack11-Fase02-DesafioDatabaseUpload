import csv from 'csvtojson';
import { getCustomRepository, getRepository, In } from 'typeorm';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(path: string): Promise<Transaction[]> {
    const filePath = path;
    const file = await csv().fromFile(filePath);

    const transactions: TransactionCSV[] = [];
    const categories: string[] = [];

    await file.forEach(item => {
      const { title, type, value, category } = item;

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    const categoryRepository = getRepository(Category);
    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];

    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const createTransactions = transactionsRepository.create(
      transactions.map(item => ({
        title: item.title,
        type: item.type,
        value: item.value,
        category: finalCategories.find(
          category => category.title === item.category,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(filePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
