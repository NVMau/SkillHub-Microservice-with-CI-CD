package knowledge

import (
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, handler *Handler) {
	api := app.Group("/api/v1")
	knowledge := api.Group("/knowledge")

	// Search knowledge (specific route)
	knowledge.Get("/search", handler.Search)

	// Get knowledge by ID (specific route)
	knowledge.Get("/:id", handler.Get)

	// Get all knowledge (generic route)
	knowledge.Get("/", handler.GetAll)

	// Create new knowledge
	knowledge.Post("/", handler.Create)

	// Delete knowledge
	knowledge.Delete("/:id", handler.Delete)
}
