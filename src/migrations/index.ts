import * as migration_20261125_212424_initial from './20261125_212424_initial';

export const migrations = [
  {
    up: migration_20261125_212424_initial.up,
    down: migration_20261125_212424_initial.down,
    name: '20261125_212424_initial'
  },
];
