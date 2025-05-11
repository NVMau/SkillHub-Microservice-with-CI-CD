package server

import (
	fibersvc "aiServiceSkilHb/internal/fibersvc"

	"go.uber.org/zap"
)

type Server struct {
	fiberSvc *fibersvc.FiberSvc
	logger   *zap.Logger
}

func NewServer(
	fiberSvc *fibersvc.FiberSvc,
	logger *zap.Logger,
) (*Server, error) {
	server := &Server{
		fiberSvc: fiberSvc,
		logger:   logger,
	}

	return server, nil
}

func (s *Server) Start() error {
	s.logger.Info("Starting server")
	s.fiberSvc.Start()
	return nil
}
