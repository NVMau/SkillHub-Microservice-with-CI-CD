package utils

import (
	"log"
	"os"
	"strconv"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

func LoggerProvider() (*zap.Logger, error) {
	zapConfig := zap.Config{
		Level:       zap.NewAtomicLevelAt(zap.InfoLevel),
		Development: false,
		Encoding:    "json",
		EncoderConfig: zapcore.EncoderConfig{
			TimeKey:        "ts",
			LevelKey:       "level",
			NameKey:        "logger",
			CallerKey:      "caller",
			MessageKey:     "msg",
			StacktraceKey:  "stacktrace",
			LineEnding:     zapcore.DefaultLineEnding,
			EncodeLevel:    zapcore.LowercaseLevelEncoder,
			EncodeTime:     zapcore.EpochTimeEncoder,
			EncodeDuration: zapcore.SecondsDurationEncoder,
			EncodeCaller:   zapcore.ShortCallerEncoder,
		},
		OutputPaths:      []string{"stderr"},
		ErrorOutputPaths: []string{"stderr"},
	}

	if logLevel, ok := os.LookupEnv("LOG_LEVEL"); ok {
		level, err := strconv.ParseInt(logLevel, 10, 8)
		if err != nil {
			log.Println("failed to parse debug level")
		}

		zapConfig.Development = true
		zapConfig.Level = zap.NewAtomicLevelAt(zapcore.Level(level))
	}

	logger, err := zapConfig.Build()
	if err != nil {
		log.Fatalf("zap.NewProduction(): %v\n", err)

		return nil, err
	}

	zap.ReplaceGlobals(logger)

	return logger, nil
}
