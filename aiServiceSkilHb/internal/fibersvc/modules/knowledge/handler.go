package knowledge

import (
	"aiServiceSkilHb/internal/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/pkg/errors"
)

type Handler struct {
	knowledgeRepo repository.KnowledgeRepository
}

func NewHandler(knowledgeRepo repository.KnowledgeRepository) *Handler {
	return &Handler{
		knowledgeRepo: knowledgeRepo,
	}
}

type CreateKnowledgeRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

type CreateKnowledgeResponse struct {
	Data *repository.Knowledge `json:"data"`
}

func (h *Handler) Create(c *fiber.Ctx) error {
	var req CreateKnowledgeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	knowledge := &repository.Knowledge{
		Title:   req.Title,
		Content: req.Content,
	}

	if err := h.knowledgeRepo.Create(c.Context(), knowledge); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.Wrap(err, "failed to create knowledge").Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(CreateKnowledgeResponse{
		Data: knowledge,
	})
}

type SearchKnowledgeRequest struct {
	Query string `query:"query"`
	Limit int    `query:"limit,default=10"`
}

type SearchKnowledgeResponse struct {
	Data []*repository.Knowledge `json:"data"`
}

func (h *Handler) Search(c *fiber.Ctx) error {
	var req SearchKnowledgeRequest
	if err := c.QueryParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid query parameters",
		})
	}

	if req.Query == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Query parameter is required",
		})
	}

	results, err := h.knowledgeRepo.Search(c.Context(), req.Query, req.Limit)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.Wrap(err, "failed to search knowledge").Error(),
		})
	}

	return c.JSON(SearchKnowledgeResponse{
		Data: results,
	})
}

type GetKnowledgeResponse struct {
	Data *repository.Knowledge `json:"data"`
}

func (h *Handler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID parameter is required",
		})
	}

	knowledge, err := h.knowledgeRepo.Get(c.Context(), id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.Wrap(err, "failed to get knowledge").Error(),
		})
	}

	return c.JSON(GetKnowledgeResponse{
		Data: knowledge,
	})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "ID parameter is required",
		})
	}

	if err := h.knowledgeRepo.Delete(c.Context(), id); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.Wrap(err, "failed to delete knowledge").Error(),
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

type GetAllKnowledgeResponse struct {
	Data       []*repository.Knowledge `json:"data"`
	Pagination struct {
		Page      int   `json:"page"`
		PageSize  int   `json:"page_size"`
		Total     int64 `json:"total"`
		TotalPage int64 `json:"total_page"`
	} `json:"pagination"`
}

func (h *Handler) GetAll(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	if page <= 0 {
		page = 1
	}

	pageSize := c.QueryInt("page_size", 10)
	if pageSize <= 0 {
		pageSize = 10
	}

	results, total, err := h.knowledgeRepo.GetAll(c.Context(), page, pageSize)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": errors.Wrap(err, "failed to get all knowledge").Error(),
		})
	}

	// Calculate total pages
	totalPages := total / int64(pageSize)
	if total%int64(pageSize) > 0 {
		totalPages++
	}

	response := GetAllKnowledgeResponse{
		Data: results,
		Pagination: struct {
			Page      int   `json:"page"`
			PageSize  int   `json:"page_size"`
			Total     int64 `json:"total"`
			TotalPage int64 `json:"total_page"`
		}{
			Page:      page,
			PageSize:  pageSize,
			Total:     total,
			TotalPage: totalPages,
		},
	}

	return c.JSON(response)
}
