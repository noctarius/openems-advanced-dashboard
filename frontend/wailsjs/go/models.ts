export namespace config {
	
	export class ForecastSolarConfig {
	    api_key: string;
	    latitude: number;
	    longitude: number;
	    damping_morning: number;
	    damping_evening: number;
	    adjust_with_actual: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ForecastSolarConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.api_key = source["api_key"];
	        this.latitude = source["latitude"];
	        this.longitude = source["longitude"];
	        this.damping_morning = source["damping_morning"];
	        this.damping_evening = source["damping_evening"];
	        this.adjust_with_actual = source["adjust_with_actual"];
	    }
	}
	export class PhotovoltaicPlane {
	    charger_name: string;
	    pv_port: number;
	    mpp_port: number;
	    declination: number;
	    azimuth: number;
	
	    static createFrom(source: any = {}) {
	        return new PhotovoltaicPlane(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.charger_name = source["charger_name"];
	        this.pv_port = source["pv_port"];
	        this.mpp_port = source["mpp_port"];
	        this.declination = source["declination"];
	        this.azimuth = source["azimuth"];
	    }
	}
	export class SystemDataConfig {
	    ip_addr: string;
	    photovoltaic_planes: PhotovoltaicPlane[];
	
	    static createFrom(source: any = {}) {
	        return new SystemDataConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ip_addr = source["ip_addr"];
	        this.photovoltaic_planes = this.convertValues(source["photovoltaic_planes"], PhotovoltaicPlane);
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
	export class GeneralConfig {
	
	
	    static createFrom(source: any = {}) {
	        return new GeneralConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class Config {
	    // Go type: GeneralConfig
	    general: any;
	    system_data: SystemDataConfig;
	    forecast_solar: ForecastSolarConfig;
	
	    static createFrom(source: any = {}) {
	        return new Config(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.general = this.convertValues(source["general"], null);
	        this.system_data = this.convertValues(source["system_data"], SystemDataConfig);
	        this.forecast_solar = this.convertValues(source["forecast_solar"], ForecastSolarConfig);
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

