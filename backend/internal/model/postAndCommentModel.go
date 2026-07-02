package model

type Post struct {
	ID               int       `json:"id"`
	AuthorID         int       `json:"authorId"`
	Author           User      `json:"author"`
	Title            string    `json:"title"`
	Content          string    `json:"content"`
	Image            string    `json:"image"`
	Tags             []string  `json:"tags"`
	Privacy          string    `json:"privacy"`
	AllowedViewerIDs []int     `json:"allowedViewerIds,omitempty"`
	CreatedAt        string    `json:"createdAt"`
	UpdatedAt        string    `json:"updatedAt"`
	Comments         []Comment `json:"comments"`
	Likes            int       `json:"likes"`
	Dislikes         int       `json:"dislikes"`
	UserLike         string    `json:"userLike"`
}

type Comment struct {
	ID        int    `json:"id"`
	PostID    int    `json:"postId"`
	Content   string `json:"content"`
	Image     string `json:"image"`
	Author    User   `json:"author"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}