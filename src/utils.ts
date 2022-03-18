import { PgColumn, PgDataTypeEnum, PgUdtNameEnum } from 'pginfo';

const numberDataTypes: PgDataTypeEnum[] = [
  PgDataTypeEnum.bigint,
  PgDataTypeEnum.double_precision,
  PgDataTypeEnum.integer,
  PgDataTypeEnum.numeric,
  PgDataTypeEnum.real,
  PgDataTypeEnum.smallint,
];

const numberUdtNames: PgUdtNameEnum[] = [
  PgUdtNameEnum._int2,
  PgUdtNameEnum.int2,
  PgUdtNameEnum.int4,
  PgUdtNameEnum.int8,
  PgUdtNameEnum.float4,
  PgUdtNameEnum.float8,
  PgUdtNameEnum._float4,
  PgUdtNameEnum._float8,
  PgUdtNameEnum.numeric,
];

const objDataTypes: PgDataTypeEnum[] = [
  PgDataTypeEnum.json,
  PgDataTypeEnum.jsonb,
];

const dateDataTypes: PgDataTypeEnum[] = [
  PgDataTypeEnum.timestamp_with_time_zone,
  PgDataTypeEnum.timestamp_without_time_zone,
];

const stringDataTypes: PgDataTypeEnum[] = [
  PgDataTypeEnum.character_varying,
  PgDataTypeEnum.char,
  PgDataTypeEnum.text,
  PgDataTypeEnum.uuid,
];

export function getTsType(c: PgColumn): string {
  let tsType = 'any';

  do {
    if (numberUdtNames.includes(c.udt_name as PgUdtNameEnum)) {
      tsType = 'number'; break;
    }
    if (numberDataTypes.includes(c.data_type as PgDataTypeEnum)) {
      tsType = 'number'; break;
    }
    if (dateDataTypes.includes(c.data_type as PgDataTypeEnum)) {
      tsType = 'Date'; break;
    }
    if (objDataTypes.includes(c.data_type as PgDataTypeEnum)) {
      tsType = 'Record<string, any>'; break;
    }
    if (stringDataTypes.includes(c.data_type as PgDataTypeEnum)) {
      tsType = 'string'; break;
    }
  } while(false); // run once

  return tsType;
}
