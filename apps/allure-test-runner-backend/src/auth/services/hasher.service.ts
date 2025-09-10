import { compare, hash } from 'bcrypt';
import { SALT_ROUNDS } from '../constants';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HasherService {
  hash(data: string): Promise<string> {
    return hash(data, SALT_ROUNDS);
  }

  isValidHash(data: string, dataHash: string): Promise<boolean> {
    return compare(data, dataHash);
  }
}
