import fse from 'fs-extra';
import { resolve } from 'path';

export function writeSchemaFileSync(outDir: string, schemaName: string, content: string): void {
  const filePath = resolve(outDir, `${schemaName}.ts`);
  // create if it does not exist
  fse.ensureFile(filePath);
  fse.writeFileSync(filePath, content);
}
