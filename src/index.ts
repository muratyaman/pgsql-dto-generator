import { Command, Option } from 'commander';
import { newDb } from './db';
import { newPgInfo } from 'pginfo';
import { PgDtoGenerator } from './PgDtoGenerator';

main();

async function main() {
  const program = new Command();
  const dbHostOption = (new Option('-h, --host <host>', 'enter host or set PGHOST')).env('PGHOST').defaultValue('localhost');
  const dbPortOption = (new Option('-p, --port <port>', 'enter port or set PGPORT')).env('PGPORT').defaultValue('5432');
  const dbUserOption = (new Option('-u, --user <user>', 'enter username or set PGUSER')).env('PGUSER');
  const dbPassOption = (new Option('-P, --password <password>', 'enter password or set PGPASSWORD')).env('PGPASSWORD');
  const dbNameOption  = (new Option('-d, --name <database>', 'enter database name or set PGDATABASE')).env('PGDATABASE');
  program
    .version('1.0.0', '-v, --version', 'output the current version')
    .option('--debug', 'turn on debugging')
    .addOption(dbHostOption)
    .addOption(dbPortOption)
    .addOption(dbUserOption)
    .addOption(dbPassOption)
    .addOption(dbNameOption)
  ;
  program.parse(process.argv);
  const options = program.opts();
  const dbOptions = {
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.password,
    database: options.database,
  };
  const db = newDb(dbOptions);
  const dbInfo = newPgInfo(db, dbOptions.database);
  const generator = new PgDtoGenerator(dbInfo);
  const results = await generator.generate();
  console.info(results);
}
