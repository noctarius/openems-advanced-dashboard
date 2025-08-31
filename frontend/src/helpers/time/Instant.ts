import moment from "moment-timezone";
import {Timestamp} from "./Timestamp";
import {Timezone, UTC} from "./Timezone";

export type UnitOfTime = moment.DurationInputArg2;
export type InstantSetObject = moment.MomentSetObject;

/**
 * An Instant represents a certain point in time at the creating
 * timezone.
 *
 * All Instant instances are immutable and calling a mutating
 * operation on them, such as _add_, will result in a new instance
 * being returned!
 */
export class Instant {
  private readonly timezone: Timezone;
  private readonly time: moment.Moment;

  /**
   * Creates a new Instant instance. This constructor shouldn't be
   * used directly, but it is recommended to use the factory methods
   * inside the Timezone class.
   *
   * @param time a moment instance
   * @param timezone a Timezone instance
   */
  constructor(time: moment.Moment, timezone: Timezone) {
    this.time = time;
    this.timezone = timezone;
  }

  public static fromDate(date: Date, timezone?: Timezone): Instant {
    const instant = UTC.parse(date.toUTCString());
    if (timezone) return instant.toTimezone(timezone);
    return instant;
  }

  /**
   * Sets a specific set of elements to the time represented by this
   * Instant, such as hour, minute, or others.
   *
   * @param obj an InstantSetObject instance
   */
  public set(obj: InstantSetObject, sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.set(obj), this.timezone);
  }

  /**
   * Adds a certain amount of time to the time represented by this
   * Instant instance.
   *
   * @param amount a number representing the amount of unit
   * @param unitOfTime a UnitOfTime instance
   */
  public add(amount: number, unitOfTime?: UnitOfTime, sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.add(amount, unitOfTime), this.timezone);
  }

  /**
   * Subtracts a certain amount of time from the time represented by
   * this Instance instance.
   *
   * @param amount a number representing the amount of unit
   * @param unitOfTime a UnitOfTime instance
   */
  public sub(amount: number, unitOfTime?: UnitOfTime, sameInstance: boolean = false): Instant {
    return this.subtract(amount, unitOfTime, sameInstance);
  }

  /**
   * Subtracts a certain amount of time from the time represented by
   * this Instance instance.
   *
   * @param amount a number representing the amount of unit
   * @param unitOfTime a UnitOfTime instance
   */
  public subtract(amount: number, unitOfTime?: UnitOfTime, sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.subtract(amount, unitOfTime), this.timezone);
  }

  public startOf(unit: moment.unitOfTime.StartOf, sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance).startOf(unit);
    return new Instant(time, this.timezone);
  }

  public endOf(unit: moment.unitOfTime.StartOf, sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance).endOf(unit);
    return new Instant(time, this.timezone);
  }

  /**
   * Returns an Instant at midnight inside the timezone on the
   * same day as the time represented by this Instant instance.
   */
  public startOfDay(sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.startOf("day"), this.timezone);
  }

  /**
   * Returns an Instant at the end of the day inside the timezone on the
   * same day as the time represented by this Instant instance.
   */
  public endOfDay(sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.endOf("day"), this.timezone);
  }

  /**
   * Returns an Instant at the start of the iso week inside the timezone
   * as the time represented by this Instant instance.
   */
  public startOfIsoWeek(sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.startOf("isoWeek"), this.timezone);
  }

  /**
   * Returns an Instant at the start of the month inside the timezone on the
   * same day as the time represented by this Instant instance.
   */
  public startOfMonth(sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.startOf("month"), this.timezone);
  }

  /**
   * Returns an Instant at the end of the month inside the timezone on the
   * same day as the time represented by this Instant instance.
   */
  public endOfMonth(sameInstance: boolean = false): Instant {
    const time = this.cloneTime(sameInstance);
    return new Instant(time.endOf("month"), this.timezone);
  }

  /**
   * Returns true if the granularity of the current and the given Instant
   * is the same, otherwise false.
   *
   * @param other the other Instant instance
   * @param unitOfTime the UnitOfTime instance
   */
  public isSame(other: Instant, unitOfTime?: UnitOfTime): boolean {
    return this.time.isSame(other.time, unitOfTime);
  }

  /**
   * Returns true if the current Instant is in between the given begin
   * and end Instant.
   *
   * @param begin the earlier Instant instance
   * @param end the later Instant instance
   */
  public isBetween(begin: Instant, end: Instant): boolean {
    return this.time.isBetween(begin.time, end.time);
  }

  /**
   * Returns true if the day of the current and the given Instant
   * is the same, otherwise false.
   *
   * @param other the other Instant instance
   */
  public sameDayAs(other: Instant): boolean {
    return this.time.isSame(other.time, "day");
  }

  /**
   * Returns true if the month of the current and the given Instant
   * is the same, otherwise false.
   *
   * @param other the other Instant instance
   */
  public sameMonthAs(other: Instant): boolean {
    return this.time.isSame(other.time, "month");
  }

  /**
   * Compares the current and the given Instant instance. It returns -1
   * if the current Instant is smaller, 0 if both are equal and 1 if
   * the given Instant instance is smaller.
   *
   * @param other the other Instant instance
   */
  public compare(other: Instant): number {
    const thisTime = this.time.unix();
    const otherTime = other.time.unix();
    if (thisTime == otherTime) return 0;
    return thisTime < otherTime ? -1 : 1;
  }

  /**
   * Returns true the current Instant instance is before the given
   * one, otherwise false.
   *
   * @param other the other Instant instance
   */
  public before(other: Instant): boolean {
    return this.compare(other) < 0;
  }

  /**
   * Returns true the current Instant instance is after the given
   * one, otherwise false.
   *
   * @param other the other Instant instance
   */
  public after(other: Instant): boolean {
    return this.compare(other) > 0;
  }

  /**
   * Returns a plain JavaScript Date instance representing the time
   * of this Instant instance.
   */
  public toDate(): Date {
    return this.time.toDate();
  }

  /**
   * Returns a number representing UNIX timestamp of this Instant
   * instance.
   */
  public toTimestamp(): Timestamp {
    return this.time.unix();
  }

  /**
   * Returns the current Instant instance as a full ISO style
   * time string: YYYY-MM-DD HH:mm:ss
   */
  public formatIsoTime(): string {
    //return this.format('YYYY-MM-DD HH:mm:ss');
    return this.time.toISOString(true);
  }

  /**
   * Returns the current Instant instance as an ISO style
   * date string: YYYY-MM-DD
   */
  public formatIsoDate(): string {
    return this.format("YYYY-MM-DD");
  }

  /**
   * Formats the current Instant instance according to the given
   * format.
   *
   * @param format a date/time format
   */
  public format(format?: string): string {
    return this.time.format(format);
  }

  /**
   * Returns the number of days (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaDays(other: Instant): number {
    const days = moment.duration(this.time.diff(other.time)).asDays();
    return Math.round(days);
  }

  /**
   * Returns the number of hours (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaHours(other: Instant): number {
    const hours = moment.duration(this.time.diff(other.time)).asHours();
    const floored = Math.floor(hours);
    return hours === floored ? floored : floored + 1;
  }

  /**
   * Returns the number of minutes (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaMinutes(other: Instant): number {
    const minutes = moment.duration(this.time.diff(other.time)).asMinutes();
    const floored = Math.floor(minutes);
    return minutes === floored ? floored : floored + 1;
  }

  /**
   * Returns the number of seconds (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaSeconds(other: Instant): number {
    const seconds = moment.duration(this.time.diff(other.time)).asSeconds();
    const floored = Math.floor(seconds);
    return seconds === floored ? floored : floored + 1;
  }

  /**
   * Returns the number of weeks (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaWeeks(other: Instant): number {
    const weeks = moment.duration(this.time.diff(other.time)).asWeeks();
    return Math.round(weeks);
  }

  /**
   * Returns the number of months (according to the date) between the
   * current Instant instance and the given one.
   *
   * @param other the other Instant instance
   */
  public deltaMonths(other: Instant): number {
    const months = moment.duration(this.time.diff(other.time)).asMonths();
    return Math.round(months);
  }

  /**
   * Returns the timezone's offset in minutes between the Instant instance's
   * timezone and the GMT / UTC timezone.
   */
  public timezoneOffset(): number {
    return this.time.toDate().getTimezoneOffset();
  }

  /**
   * Returns the Timezone instance.
   */
  public whichTimezone(): Timezone {
    return this.timezone;
  }

  /**
   * Expose moment.get function
   */
  public get(unit: moment.unitOfTime.All) {
    return this.time.get(unit);
  }

  /**
   * Creates a new Instant instance which represents the same point in time
   * at a different (given) timezone.
   *
   * @param timezone the new timezone
   */
  public toTimezone(timezone: Timezone): Instant {
    return timezone.timestamp(this.time.unix());
  }

  private cloneTime(sameInstance: boolean): moment.Moment {
    return !sameInstance ? moment(this.time) : this.time;
  }

  public static get [Symbol.toStringTag](): string {
    return "Instant";
  }
}
