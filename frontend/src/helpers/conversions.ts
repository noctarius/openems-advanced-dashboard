import {openems} from "../../wailsjs/go/models";
import ChannelItem = openems.ChannelItem;

export const convertPercent = (item: number, zeroToHundred: boolean = false): string => {
    if (zeroToHundred) {
        item = item / 100;
    }
    return `${Math.round(item * 10000) / 100}%`;
}

export const convertWatts = (item: ChannelItem | undefined | number, abs: boolean = true): string | undefined => {
    if (item === undefined) return undefined;
    const watts = typeof item === "object" ? item.unit === "W" ? item.value : item.value * 1000 : item;
    const val = abs ? Math.abs(watts) : watts;
    if (Math.abs(watts) >= 1000) {
        return `${Math.round(val / 1000 * 100) / 100} kW`;
    }
    return `${val} W`;
}

export const convertVolts = (item: ChannelItem | undefined | number): string | undefined => {
    if (item === undefined) return undefined;
    const volts = typeof item === "object" ? item.unit === "mV" ? item.value : item.value * 1000 : item;
    if (volts >= 1000) {
        return `${Math.round(volts / 1000 * 100) / 100} V`;
    }
    return `${volts} mV`;
}

export const covertHertz = (item: ChannelItem | undefined | number): string | undefined => {
    if (item === undefined) return undefined;
    const hertz = typeof item === "object" ? item.unit === "mHz" ? item.value : item.value * 1000 : item;
    if (hertz >= 10000) {
        return `${Math.round(hertz / 1000 * 100) / 100} Hz`;
    }
    return `${hertz} mHz`;
}

export const limitTextLength = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}

export const powerChannelStatus = (value: number, atZero: string, negative: string, positive: string): string => {
    if (value === 0) {
        return atZero;
    } else if (value < 0) {
        return negative;
    } else {
        return positive;
    }
}
