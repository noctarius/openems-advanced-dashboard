export namespace errors {
	
	export class GoError {
	    message: string;
	    stackTrace: string[];
	
	    static createFrom(source: any = {}) {
	        return new GoError(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.message = source["message"];
	        this.stackTrace = source["stackTrace"];
	    }
	}

}

export namespace openems {
	
	export class Response {
	    body?: string;
	    statusCode: number;
	    error?: errors.GoError;
	
	    static createFrom(source: any = {}) {
	        return new Response(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.body = source["body"];
	        this.statusCode = source["statusCode"];
	        this.error = this.convertValues(source["error"], errors.GoError);
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

export namespace solarforecast {
	
	export class SolarPlane {
	    ChargerName: string;
	    Declination: number;
	    Azimuth: number;
	    WattsPeak: number;
	
	    static createFrom(source: any = {}) {
	        return new SolarPlane(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ChargerName = source["ChargerName"];
	        this.Declination = source["Declination"];
	        this.Azimuth = source["Azimuth"];
	        this.WattsPeak = source["WattsPeak"];
	    }
	}
	export class Configuration {
	    ApiKey?: string;
	    Latitude: number;
	    Longitude: number;
	    Planes: SolarPlane[];
	
	    static createFrom(source: any = {}) {
	        return new Configuration(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ApiKey = source["ApiKey"];
	        this.Latitude = source["Latitude"];
	        this.Longitude = source["Longitude"];
	        this.Planes = this.convertValues(source["Planes"], SolarPlane);
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
	export class ForecastEntry {
	    time: number;
	    value: number;
	
	    static createFrom(source: any = {}) {
	        return new ForecastEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.time = source["time"];
	        this.value = source["value"];
	    }
	}
	export class Forecast {
	    watts: ForecastEntry[];
	    wattHours: ForecastEntry[];
	    wattHoursPeriod: ForecastEntry[];
	    wattHoursDay: ForecastEntry[];
	
	    static createFrom(source: any = {}) {
	        return new Forecast(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.watts = this.convertValues(source["watts"], ForecastEntry);
	        this.wattHours = this.convertValues(source["wattHours"], ForecastEntry);
	        this.wattHoursPeriod = this.convertValues(source["wattHoursPeriod"], ForecastEntry);
	        this.wattHoursDay = this.convertValues(source["wattHoursDay"], ForecastEntry);
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

