import { Pool } from 'pg';

export function newDb(input: IDbInput) {
  const pool = new Pool(input);

  pool.on('error', err => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  return pool;
}

export interface IDbInput {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
