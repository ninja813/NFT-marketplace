import { NFT } from '../models/NFT';
import { User } from '../models/User';
import { Collection } from '../models/Collection';
import { Transaction } from '../models/Transaction';

export async function up() {
  await Promise.all([
    User.syncIndexes(),
    Collection.syncIndexes(),
    NFT.syncIndexes(),
    Transaction.syncIndexes(),
  ]);
}

export async function down() {}
