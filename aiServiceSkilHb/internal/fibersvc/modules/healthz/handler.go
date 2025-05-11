package healthz

import "github.com/gofiber/fiber/v2"

func Handler(app *fiber.App) {
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.SendString("ok")
	})
}
