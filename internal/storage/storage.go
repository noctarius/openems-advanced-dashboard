package storage

import (
	"io"
	"os"
	"path"
)

const configDirName = "openems-advanced-dashboard"

func EnsureConfigDirectory() error {
	configDir, err := findConfigDirectory()
	if err != nil {
		return err
	}

	if _, err := os.Stat(configDir); os.IsNotExist(err) {
		return os.Mkdir(configDir, 0755)
	}

	return nil
}

func ReadFileFromStorage(filename string) (string, error) {
	data, err := readFileData(filename)
	if err != nil {
		return "", err
	}
	return string(data), nil
}

func ReadBinaryFromStorage(filename string) ([]byte, error) {
	return readFileData(filename)
}

func WriteFileToStorage(filename string, data string, override bool) error {
	return writeFileData(filename, []byte(data), override)
}

func WriteBinaryToStorge(filename string, data []byte, override bool) error {
	return writeFileData(filename, data, override)
}

func readFileData(filename string) ([]byte, error) {
	filepath, err := makeFilepath(filename)
	if err != nil {
		return nil, err
	}

	_, err = os.Stat(filepath)
	if err != nil {
		return nil, err
	}

	file, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}

	return io.ReadAll(file)
}

func writeFileData(filename string, data []byte, override bool) error {
	filepath, err := makeFilepath(filename)
	if err != nil {
		return err
	}

	_, err = os.Stat(filepath)
	if err != nil {
		if !os.IsNotExist(err) || !override {
			return err
		}
	} else {
		if err := os.Remove(filepath); err != nil {
			return err
		}
	}

	file, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer file.Close()

	if _, err := file.Write(data); err != nil {
		return err
	}
	return nil
}

func makeFilepath(filename string) (string, error) {
	configDir, err := findConfigDirectory()
	if err != nil {
		return "", err
	}

	return path.Join(configDir, filename), nil
}

func findConfigDirectory() (string, error) {
	dir, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}

	return path.Join(dir, configDirName), nil
}
