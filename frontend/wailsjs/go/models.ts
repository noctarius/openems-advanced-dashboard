export namespace openems {
	
	export class Response {
	    body?: string;
	    statusCode: number;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.body = source["body"];
	        this.statusCode = source["statusCode"];
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

