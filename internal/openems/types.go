package openems

type ModuleTemperature struct {
	Id        int    `json:"id"`
	BatteryId int    `json:"batteryId"`
	TowerId   int    `json:"towerId"`
	ModuleId  int    `json:"moduleId"`
	Unit      string `json:"unit"`
	Value     int    `json:"value"`
}

type Cell struct {
	*ChannelItem
	Id        int `json:"id"`
	BatteryId int `json:"batteryId"`
	TowerId   int `json:"towerId"`
	ModuleId  int `json:"moduleId"`
}

type Module struct {
	Id           int                  `json:"id"`
	BatteryId    int                  `json:"batteryId"`
	TowerId      int                  `json:"towerId"`
	Cells        []*Cell              `json:"cells"`
	Temperatures []*ModuleTemperature `json:"temperatures"`

	cells map[int]*Cell
}

type Tower struct {
	Id        int       `json:"id"`
	BatteryId int       `json:"batteryId"`
	Modules   []*Module `json:"modules"`

	modules map[int]*Module
}

type Battery struct {
	Id     int      `json:"id"`
	Towers []*Tower `json:"towers"`

	towers map[int]*Tower
}

type ValueType string

const (
	ValueTypeShort  ValueType = "SHORT"
	ValueTypeInt    ValueType = "INTEGER"
	ValueTypeLong   ValueType = "LONG"
	ValueTypeFloat  ValueType = "FLOAT"
	ValueTypeDouble ValueType = "DOUBLE"
	ValueTypeString ValueType = "STRING"
	ValueTypeBool   ValueType = "BOOLEAN"
)

type AccessMode string

const (
	AccessModeReadOnly  AccessMode = "RO"
	AccessModeReadWrite AccessMode = "RW"
	AccessModeWriteOnly AccessMode = "WO"
)

type ChannelItem struct {
	Address    string      `json:"address"`
	Type       ValueType   `json:"type"`
	AccessMode AccessMode  `json:"accessMode"`
	Text       string      `json:"text"`
	Unit       string      `json:"unit"`
	Value      interface{} `json:"value"`
}

type Component struct {
	Alias      string                 `json:"alias"`
	FactoryId  string                 `json:"factoryId"`
	Properties map[string]interface{} `json:"properties"`
}

type HistoricTimeseries struct {
	Timestamps []string              `json:"timestamps"`
	Data       map[string][]*float64 `json:"data"`
}

// ### PRIVATE TYPES ###

type componentsListing struct {
	Components map[string]Component `json:"components"`
}

type jsonRpcCall struct {
	Jsonrpc string      `json:"jsonrpc"`
	Id      string      `json:"id"`
	Method  string      `json:"method"`
	Params  interface{} `json:"params"`
}

type jsonRpcResponse[ResultType any] struct {
	Jsonrpc string     `json:"jsonrpc"`
	Id      string     `json:"id"`
	Result  ResultType `json:"result"`
	Error   *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

type historicTimeseriesEnergyPerPeriodQuery struct {
	Timezone   string   `json:"timezone"`
	FromDate   string   `json:"fromDate"`
	ToDate     string   `json:"toDate"`
	Channels   []string `json:"channels"`
	Resolution struct {
		Value int    `json:"value"`
		Unit  string `json:"unit"`
	} `json:"resolution"`
}
