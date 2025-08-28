package openems

import (
	"fmt"
	"regexp"
	"slices"
	"strconv"

	"github.com/samber/lo"
)

var cellIdExtractor = regexp.MustCompile("battery([0-9]+)/Tower([0-9]+)Module([0-9]+)Cell([0-9]+)Voltage")
var moduleTemperatureIdExtractor = regexp.MustCompile("battery([0-9]+)/Tower([0-9]+)Module([0-9]+)TemperatureSensor([0-9]+)")

func (o *OpenEms) ReadBatteries() ([]*Battery, error) {
	channelItems, err := o.GetComponent("battery0")
	if err != nil {
		return nil, err
	}

	cells := lo.Filter(channelItems, func(item ChannelItem, _ int) bool {
		return cellIdExtractor.MatchString(item.Address)
	})

	temperatures := lo.Filter(channelItems, func(item ChannelItem, _ int) bool {
		return moduleTemperatureIdExtractor.MatchString(item.Address)
	})

	return mapBatteriesTowersModulesCells(cells, temperatures)
}

func mapBatteriesTowersModulesCells(cells, temperatures []ChannelItem) ([]*Battery, error) {
	batteries := make(map[int]*Battery)
	for _, cell := range cells {
		ids := cellIdExtractor.FindStringSubmatch(cell.Address)
		if len(ids) != 5 {
			return nil, fmt.Errorf("invalid cell address: %s", cell.Address)
		}

		batteryId, err := strconv.Atoi(ids[1])
		if err != nil {
			return nil, err
		}
		towerId, err := strconv.Atoi(ids[2])
		if err != nil {
			return nil, err
		}
		moduleId, err := strconv.Atoi(ids[3])
		if err != nil {
			return nil, err
		}
		t := ids[4]
		cellId, err := strconv.Atoi(t)
		if err != nil {
			return nil, err
		}

		battery, ok := batteries[batteryId]
		if !ok {
			battery = &Battery{
				Id:     batteryId,
				towers: make(map[int]*Tower),
			}
			batteries[batteryId] = battery
		}

		tower, ok := battery.towers[towerId]
		if !ok {
			tower = &Tower{
				Id:        towerId,
				BatteryId: batteryId,
				modules:   make(map[int]*Module),
			}
			battery.towers[towerId] = tower
		}

		module, ok := tower.modules[moduleId]
		if !ok {
			module = &Module{
				Id:        moduleId,
				BatteryId: batteryId,
				TowerId:   towerId,
				cells:     make(map[int]*Cell),
			}
			tower.modules[moduleId] = module
		}

		module.cells[cellId] = &Cell{
			Id:          cellId,
			BatteryId:   batteryId,
			TowerId:     towerId,
			ModuleId:    moduleId,
			ChannelItem: &cell,
		}
	}

	for _, battery := range batteries {
		for _, tower := range battery.towers {
			for _, module := range tower.modules {
				moduleTemperatures, err := collectModuleTemperatures(module, temperatures)
				if err != nil {
					return nil, err
				}
				module.Temperatures = moduleTemperatures
			}
		}
	}

	batteryArray := lo.Values(batteries)
	slices.SortFunc(batteryArray, func(a, b *Battery) int {
		return a.Id - b.Id
	})

	for _, battery := range batteryArray {
		towerArray := lo.Values(battery.towers)
		slices.SortFunc(towerArray, func(a, b *Tower) int {
			return a.Id - b.Id
		})
		battery.Towers = towerArray
		battery.towers = nil

		for _, tower := range battery.Towers {
			moduleArray := lo.Values(tower.modules)
			slices.SortFunc(moduleArray, func(a, b *Module) int {
				return a.Id - b.Id
			})
			tower.Modules = moduleArray
			tower.modules = nil

			for _, module := range tower.Modules {
				cellArray := lo.Values(module.cells)
				slices.SortFunc(cellArray, func(a, b *Cell) int {
					return a.Id - b.Id
				})
				module.Cells = cellArray
				module.cells = nil
			}
		}
	}

	return batteryArray, nil
}

func collectModuleTemperatures(module *Module, temperatures []ChannelItem) ([]*ModuleTemperature, error) {
	moduleTemperatures := make([]*ModuleTemperature, 0)

	for _, temperature := range temperatures {
		ids := moduleTemperatureIdExtractor.FindStringSubmatch(temperature.Address)
		if len(ids) != 5 {
			return nil, fmt.Errorf("invalid temperature address: %s", temperature.Address)
		}

		batteryId, err := strconv.Atoi(ids[1])
		if err != nil {
			return nil, err
		}
		if batteryId != module.BatteryId {
			continue
		}
		towerId, err := strconv.Atoi(ids[2])
		if err != nil {
			return nil, err
		}
		if towerId != module.TowerId {
			continue
		}
		moduleId, err := strconv.Atoi(ids[3])
		if err != nil {
			return nil, err
		}
		if module.Id != moduleId {
			continue
		}
		temperatureSensorId, err := strconv.Atoi(ids[4])
		if err != nil {
			return nil, err
		}

		moduleTemperatures = append(moduleTemperatures, &ModuleTemperature{
			Id:        temperatureSensorId,
			BatteryId: batteryId,
			TowerId:   towerId,
			ModuleId:  moduleId,
			Unit:      temperature.Unit,
			Value:     int(temperature.Value.(float64)),
		})
	}

	slices.SortFunc(moduleTemperatures, func(a, b *ModuleTemperature) int {
		return a.Id - b.Id
	})
	return moduleTemperatures, nil
}
