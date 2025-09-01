import { Instant } from "./Instant";

export class TimeRange {
  readonly #start: Instant | undefined;
  readonly #end: Instant | undefined;

  constructor(start: Instant | undefined, end: Instant | undefined) {
    this.#start = start;
    this.#end = end;
  }

  get start(): Instant | undefined {
    return this.#start;
  }

  get end(): Instant | undefined {
    return this.#end;
  }
}
