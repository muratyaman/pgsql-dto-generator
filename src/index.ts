import dotenv from 'dotenv';
import { PgInfoService } from 'pgsqlinfo';
import { makeCommand } from './cmd';
import { writeSchemaFile } from './files';
import { PgDtoGenerator } from './PgDtoGenerator';

dotenv.config();
main();

async function main() {
  const cmd = makeCommand();

  cmd.parse(process.argv);
  const options = cmd.opts();

  const dbOptions = {
    host: options.host,
    port: options.port,
    user: options.user,
    password: options.password,
    database: options.database,
  };

  const outDir = options.outdir;

  const dbInfo = new PgInfoService(dbOptions, dbOptions.database);
  // const one = await dbInfo.query('SELECT 1 AS one');

  const generator = new PgDtoGenerator(dbInfo);

  console.info('begin!');
  const schemaOutputList = await generator.generate();
  for (const schemaOutput of schemaOutputList) {
    writeSchemaFile(outDir, schemaOutput.schemaName, schemaOutput.content);
  }
  console.info('the end!');
  process.exit(0);
}
