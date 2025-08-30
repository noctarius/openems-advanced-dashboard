package config

import (
	"encoding/json"
	"myproject/internal/storage"
	"os"
)

var config *Config

func init() {
	if err := storage.EnsureConfigDirectory(); err != nil {
		panic(err)
	}

	config = &Config{}
	if content, err := storage.ReadFileFromStorage("settings.json"); err == nil {
		if err := json.Unmarshal([]byte(content), config); err != nil {
			panic(err)
		}
	} else {
		if !os.IsNotExist(err) {
			panic(err)
		}
	}
}

func GetConfig() *Config {
	return config
}

func SaveConfig(c Config) error {
	config = &c
	content, err := json.Marshal(c)
	if err != nil {
		return err
	}
	return storage.WriteFileToStorage("settings.json", string(content), true)
}
