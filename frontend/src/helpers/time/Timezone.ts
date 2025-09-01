import moment from "moment-timezone";
import { Instant } from "./Instant.js";
import { Timestamp } from "./Timestamp";

export type ParseFormatSpecification = moment.MomentFormatSpecification;

export class Timezone {
  private readonly timezone: string;

  private constructor(timezone: string) {
    this.timezone = timezone;
  }

  public now(): Instant {
    return this.toTimezone(moment());
  }

  public timestamp(timestamp: Timestamp): Instant {
    if (typeof timestamp !== "number") {
      return this.parse(timestamp);
    }
    return this.toTimezone(moment.unix(timestamp));
  }

  public parse(value: any, format?: ParseFormatSpecification): Instant {
    if (format) {
      return this.toTimezone(moment.tz(value, format, this.timezone));
    }
    return this.toTimezone(moment.tz(value, this.timezone));
  }

  public toString(): string {
    return this.timezone;
  }

  public get [Symbol.toStringTag](): string {
    return "Timezone";
  }

  private toTimezone(time: moment.Moment): Instant {
    return new Instant(time.tz(this.timezone), this);
  }

  public static timezone(timezone: string): Timezone {
    return new Timezone(timezone);
  }
}

export const UTC = Timezone.timezone("UTC");

export const LOCAL = Timezone.timezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
