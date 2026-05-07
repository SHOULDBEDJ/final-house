import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.DATABASE_URL || 'file:local.db';
const authToken = process.env.DATABASE_TOKEN;

export const db = createClient({
  url,
  authToken,
});

export default db;
