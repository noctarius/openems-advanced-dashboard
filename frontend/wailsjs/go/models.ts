export namespace openems {
	
	export class ModuleTemperature {
	    id: number;
	    batteryId: number;
	    towerId: number;
	    moduleId: number;
	    unit: string;
	    value: number;
	
	    static createFrom(source: any = {}) {
	        return new ModuleTemperature(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.batteryId = source["batteryId"];
	        this.towerId = source["towerId"];
	        this.moduleId = source["moduleId"];
	        this.unit = source["unit"];
	        this.value = source["value"];
	    }
	}
	export class Cell {
	    address: string;
	    type: string;
	    accessMode: string;
	    text: string;
	    unit: string;
	    value: any;
	    id: number;
	    batteryId: number;
	    towerId: number;
	    moduleId: number;
	
	    static createFrom(source: any = {}) {
	        return new Cell(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.address = source["address"];
	        this.type = source["type"];
	        this.accessMode = source["accessMode"];
	        this.text = source["text"];
	        this.unit = source["unit"];
	        this.value = source["value"];
	        this.id = source["id"];
	        this.batteryId = source["batteryId"];
	        this.towerId = source["towerId"];
	        this.moduleId = source["moduleId"];
	    }
	}
	export class Module {
	    id: number;
	    batteryId: number;
	    towerId: number;
	    cells: Cell[];
	    temperatures: ModuleTemperature[];
	
	    static createFrom(source: any = {}) {
	        return new Module(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.batteryId = source["batteryId"];
	        this.towerId = source["towerId"];
	        this.cells = this.convertValues(source["cells"], Cell);
	        this.temperatures = this.convertValues(source["temperatures"], ModuleTemperature);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Tower {
	    id: number;
	    batteryId: number;
	    modules: Module[];
	
	    static createFrom(source: any = {}) {
	        return new Tower(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.batteryId = source["batteryId"];
	        this.modules = this.convertValues(source["modules"], Module);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Battery {
	    id: number;
	    towers: Tower[];
	
	    static createFrom(source: any = {}) {
	        return new Battery(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.towers = this.convertValues(source["towers"], Tower);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ChannelItem {
	    address: string;
	    type: string;
	    accessMode: string;
	    text: string;
	    unit: string;
	    value: any;
	
	    static createFrom(source: any = {}) {
	        return new ChannelItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.address = source["address"];
	        this.type = source["type"];
	        this.accessMode = source["accessMode"];
	        this.text = source["text"];
	        this.unit = source["unit"];
	        this.value = source["value"];
	    }
	}
	export class HistoricTimeseries {
	    timestamps: string[];
	    data: Record<string, Array<number>>;
	
	    static createFrom(source: any = {}) {
	        return new HistoricTimeseries(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.timestamps = source["timestamps"];
	        this.data = source["data"];
	    }
	}
	
	

}

export namespace solarforecast {
	
	export class ForecastEntry {
	    Time: number;
	    Value: number;
	
	    static createFrom(source: any = {}) {
	        return new ForecastEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Time = source["Time"];
	        this.Value = source["Value"];
	    }
	}
	export class Forecast {
	    watts: ForecastEntry[];
	    watt_hours: ForecastEntry[];
	    watt_hours_period: ForecastEntry[];
	    watt_hours_day: ForecastEntry[];
	
	    static createFrom(source: any = {}) {
	        return new Forecast(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.watts = this.convertValues(source["watts"], ForecastEntry);
	        this.watt_hours = this.convertValues(source["watt_hours"], ForecastEntry);
	        this.watt_hours_period = this.convertValues(source["watt_hours_period"], ForecastEntry);
	        this.watt_hours_day = this.convertValues(source["watt_hours_day"], ForecastEntry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace time {
	
	export class Time {
	
	
	    static createFrom(source: any = {}) {
	        return new Time(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

