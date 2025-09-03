package errors

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"myproject/internal/storage"
	"os"
	"path"
	goruntime "runtime"
	"runtime/pprof"
	"strings"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func StoreErrorLog(ctx context.Context, errorLog string) string {
	configDir, err := storage.GetConfigDirectory()
	if err != nil {
		runtime.LogError(ctx, err.Error())
		return ""
	}

	for {
		filename := fmt.Sprintf("err_%s.txt", time.Now().UTC().Format("20060102T150405.000"))
		filepath := path.Join(configDir, filename)
		_, err := os.Stat(filepath)
		if os.IsExist(err) {
			time.Sleep(time.Duration(20+rand.Intn(80)) * time.Millisecond)
			continue
		}
		runtime.LogError(ctx, errorLog)
		if err := storage.WriteFileToStorage(filename, errorLog, true); err != nil {
			runtime.LogError(ctx, err.Error())
			return ""
		}
		return filename
	}
}

func GetSystemConfiguration() string {
	operatorSystem := goruntime.GOOS
	architecture := goruntime.GOARCH
	cpuCount := goruntime.NumCPU()
	memStats := goruntime.MemStats{}
	goruntime.ReadMemStats(&memStats)
	stackTraces := &strings.Builder{}
	pprof.Lookup("goroutine").WriteTo(stackTraces, 1)
	blockedThreads := &strings.Builder{}
	pprof.Lookup("block").WriteTo(blockedThreads, 1)
	heapAllocations := &strings.Builder{}
	pprof.Lookup("heap").WriteTo(heapAllocations, 1)

	systemConfiguration := map[string]interface{}{
		"operatorSystem":  operatorSystem,
		"architecture":    architecture,
		"cpuCount":        cpuCount,
		"memStats":        memStats,
		"stackTraces":     stackTraces.String(),
		"blockedThreads":  blockedThreads.String(),
		"heapAllocations": heapAllocations.String(),
	}

	data, err := json.Marshal(systemConfiguration)
	if err != nil {
		println(err.Error())
		return ""
	}
	return string(data)
}
