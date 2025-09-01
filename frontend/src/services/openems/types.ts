export enum SellToGridLimitState {
  Undefined = -1,
  ActiveLimitFixed = 0,
  NoLimit = 1,
  NoFeasibleSolution = 2,
  ActiveLimitConstraint = 3,
  Disabled = 4,
  NotStarted = 5,
}

export function sellToGridLimitStateToString(state: SellToGridLimitState): string {
  switch (state) {
    case SellToGridLimitState.Undefined:
      return "Unknown";
    case SellToGridLimitState.ActiveLimitFixed:
      return "Active (limiting)";
    case SellToGridLimitState.NoLimit:
      return "Active (no limit)";
    case SellToGridLimitState.NoFeasibleSolution:
      return "No feasible solution";
    case SellToGridLimitState.ActiveLimitConstraint:
      return "Active (limiting)";
    case SellToGridLimitState.Disabled:
      return "Normal";
    case SellToGridLimitState.NotStarted:
      return "Active (not started)";
  }
}

export interface Component {
  alias: string;
  factoryId: string;
  properties: { [key: string]: any };
}

export interface ValueEntity {
  value: number;
  unit: string;
}

export interface PhotovoltaicPlane {
  componentName: string;
  id: number;
  alias: string;
  pvPort: number;
  pvPortName: string;
  mpptPort: number;
  mpptPortName: string;
  modbusAdapter: string;
  inverterName: string;
  maxVoltage: ValueEntity;
  maxPower: ValueEntity;
}

export type ValueType = "SHORT" | "INTEGER" | "LONG" | "FLOAT" | "DOUBLE" | "STRING" | "BOOLEAN";

export type AccessMode = "RO" | "RW" | "WO";

export interface ChannelItem {
  address: string;
  type: ValueType;
  accessMode: AccessMode;
  text: string;
  unit: string;
  value: any;
}

export interface ModuleTemperature {
  id: number;
  batteryId: number;
  towerId: number;
  moduleId: number;
  value: number;
  unit: string;
}

export interface Cell extends ChannelItem {
  id: number;
  batteryId: number;
  towerId: number;
  moduleId: number;
}

export interface Module {
  id: number;
  batteryId: number;
  towerId: number;
  cells: Cell[];
  temperatures: ModuleTemperature[];
}

export interface Tower {
  id: number;
  batteryId: number;
  modules: Module[];
}

export interface Battery {
  id: number;
  towers: Tower[];
}

export interface HistoricTimeseries {
  timestamps: string[];
  data: Record<string, (number | null)[]>;
}
