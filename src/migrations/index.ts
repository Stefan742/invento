import * as migration_20261125_212424_initial from './20261125_212424_initial';
import * as migration_20261125_215641_orders_m3 from './20261125_215641_orders_m3';
import * as migration_20261126_021637_storage_s3 from './20261126_021637_storage_s3';

export const migrations = [
  {
    up: migration_20261125_212424_initial.up,
    down: migration_20261125_212424_initial.down,
    name: '20261125_212424_initial',
  },
  {
    up: migration_20261125_215641_orders_m3.up,
    down: migration_20261125_215641_orders_m3.down,
    name: '20261125_215641_orders_m3',
  },
  {
    up: migration_20261126_021637_storage_s3.up,
    down: migration_20261126_021637_storage_s3.down,
    name: '20261126_021637_storage_s3'
  },
];
