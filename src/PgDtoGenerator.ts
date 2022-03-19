import { PgInfoService, PgColumn, PgTable } from 'pgsqlinfo';
import { getTsType } from './utils';

export class PgDtoGenerator {
  constructor(protected _pgInfo: PgInfoService) {

  }

  async generate(): Promise<GenerateSchemaOutput[]> {
    console.debug('PgDtoGenerator generating DTOs...');
    let output: GenerateSchemaOutput[] = [];

    const schemaRows = await this._pgInfo.schemata();
    
    output.push(this._generateCommonTypes());

    for (const schemaRow of schemaRows) {
      if (!schemaRow.schema_name) continue; // null is not expected
      const schemaOut = await this._generateSchema(schemaRow.schema_name);
      output.push(schemaOut);
    }

    console.debug('PgDtoGenerator generating DTOs... done!');
    return output;
  }

  _generateCommonTypes(): GenerateSchemaOutput {
    const content = `
// recursive JSON type; you can append nullable or not
export type JsonType = string | number | boolean | { [x: string]: JsonType } | Array<JsonType>;
    `
    return { schemaName: '_types', content };
  }

  async _generateSchema(schemaName: string): Promise<GenerateSchemaOutput> {
    console.debug(' - generate schema', schemaName, '...');
    let modelList: string[] = [];

    const schema = this._pgInfo.schema(schemaName);

    const tableRows = await schema.tables();
    const columnRows = await schema.columns();

    for (const tableRow of tableRows) {
      if (!tableRow.table_name) continue; // null is not expected
      const columnsOfTable = columnRows.filter(c => c.table_name === tableRow.table_name)
      const tableModels = this._generateTableModels(tableRow, columnsOfTable);
      modelList.push(tableModels);
    }
    const modelsText = modelList.join('\n');
    const content = `
import { JsonType } from './_types';
${modelsText}
`;
    console.debug(' - generate schema', schemaName, '... done!');
    return { schemaName, content };
  }

  _generateTableModels(table: PgTable, columns: PgColumn[]): string {
    const tableName = table.table_name ?? '';
    console.debug(' -- generate table models', tableName, '...');
    const columnListAll = columns.map(column => ({ column, ts: this._generateColumnDefinition(column) }));
    const columnListWritable = columnListAll.filter(c => c.column.is_updatable === 'YES').map(c => c.ts);

    const allColumnsWritable = columnListAll.length === columnListWritable.length;

    const tableComment = table.table_comment ?? '';
    const comment = tableComment ? `\n * ${tableComment}` : '';

    let output = '';
    do {
      if (allColumnsWritable) {
        const columnListAllText = columnListAll.map(({ ts }) => ts).join('\n');

        // no indentation in table template
        output = `
/**
 * Model for read & write operations on table ${tableName}${comment}
 */
export interface ${tableName}DtoWritable {
${columnListAllText}
}
export type ${tableName}Dto = ${tableName}DtoWritable;`;

        break;
      }

      const columnListToWriteText = columnListWritable.join('\n');
      const columnListReadOnly = columnListAll.filter(c => c.column.is_updatable === 'NO').map(c => c.ts);
      const columnListReadOnlyText = columnListReadOnly.join('\n');

      // no indentation in table template
      output = `
/**
 * Model for write operations on table ${tableName}${comment}
 */
export interface ${tableName}DtoWritable {
${columnListToWriteText}
}
/**
 * Model for read operations on table ${tableName}
 */
export interface ${tableName}Dto extends ${tableName}DtoWritable {
${columnListReadOnlyText}
}`;

    } while(false); // loop once

    console.debug(' -- generate table models', tableName, '...');
    return output;
  }

  _generateColumnDefinition(c: PgColumn): string {
    let readonly = c.is_updatable === 'NO' ? 'readonly' : '';
    let nullable = c.is_nullable === 'YES' ? ' | null' : '';
    let maxChars = c.character_maximum_length ? `(${c.character_maximum_length})` : '';
    let tsType = getTsType(c);

    const columnComment = c.column_comment ?? '';
    let comment = columnComment ? `\n   * ${columnComment}` : '';

    let domain = c.domain_name ? `; Domain: ${c.domain_schema}.${c.domain_name}`: '';

    // 2-space indentation in column template
    return `
  /**${comment}
   * Type: ${c.data_type}${maxChars}; UDT: ${c.udt_schema}.${c.udt_name}${domain}
   * Default value: ${c.column_default}
   */
  ${readonly}${c.column_name}: ${tsType}${nullable};`;
  }
}

export interface GenerateSchemaOutput {
  schemaName: string;
  content: string;
}
