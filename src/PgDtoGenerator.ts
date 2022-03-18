import { PgInfo, IColumn } from './PgInfo';

export class PgDtoGenerator {
  constructor(protected dbInfo: PgInfo) {

  }

  async generate(): Promise<string> {
    let text = '';

    const schemaRows = await this.dbInfo.schemata();
    for (const schemaRow of schemaRows) {
      if (!schemaRow.schema_name) continue; // null is not expected
      text += this._generateSchema(schemaRow.schema_name);
    }

    return text;
  }

  async _generateSchema(schemaName: string): Promise<string> {
    let text = '';

    const schema = this.dbInfo.schema(schemaName);
    const tableRows = await schema.tables();
    const columnRows = await schema.columns();
    for (const tableRow of tableRows) {
      if (!tableRow.table_name) continue; // null is not expected
      const table = schema.table(tableRow.table_name);
      //const columnsOfTable = await table.columns();
      const columnsOfTable = columnRows.filter(c => c.table_name === table._tableName)
      text += this._generateTableModel(tableRow.table_name, columnsOfTable);
    }

    return text;
  }

  _generateTableModel(tableName: string, columns: IColumn[]) {
    const columnListAll = columns.map(column => ({ column, ts: this.generateColumnDefinition(column) }));
    const columnListAllText = columnListAll.map(({ ts }) => ts).join('\n');
    const columnListToWrite = columnListAll.filter(c => c.column.is_updatable === 'YES').map(c => c.ts);
    const columnListToWriteText = columnListToWrite.join('\n');
    return `
  /**
   * Model for ${tableName} read operations
   * TODO: describe ${tableName}
   */
  export interface ${tableName} {
  ${columnListAllText}
  }

  /**
   * Model for ${tableName} write operations
   * TODO: describe ${tableName}
   */
  export interface ${tableName}ToWrite {
  ${columnListToWriteText}
  }
  `;
  }

  generateColumnDefinition(c: IColumn): string {
    let readonly = c.is_updatable === 'YES' ? '' : 'readonly';
    let nullable = c.is_nullable === 'YES' ? ' | null' : '';
    let typeInfo = 'string';
    let note = '';
    
    return `
    /**
     * ${note}
     * Data type: ${c.data_type}
     * UDT name: ${c.udt_name}
     * Default value: ${c.column_default}
     */
    ${readonly}${c.column_name}: ${typeInfo}${nullable};
  `;
  }
}
