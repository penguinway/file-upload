package main

import (
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "./clipboard.db")
	if err != nil {
		panic(err)
	}
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS clipboard (id INTEGER PRIMARY KEY AUTOINCREMENT, context TEXT NOT NULL, time TIMESTAMP NOT NULL
                         DEFAULT (datetime('now', 'localtime') ))`)
	if err != nil {
		panic(err)
	}
}

func main() {
	// Print the current working directory for debugging
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fmt.Println("Current working directory:", wd)

	router := gin.Default()

	// 允许跨域
	router.Use(cors.Default())

	router.LoadHTMLGlob("web/index.html")
	router.Static("static", "web/static")

	// GET / /list 显示 index.html
	router.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})
	router.GET("/list", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	router.GET("/clipboard", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.html", nil)
	})

	// GET /file 返回目录下的文件列表
	router.GET("/file", func(c *gin.Context) {
		files, err := ioutil.ReadDir("./uploads")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		filenames := []string{}
		for _, file := range files {
			filenames = append(filenames, file.Name())
		}
		c.JSON(http.StatusOK, gin.H{"files": filenames})
	})

	// POST /upload 上传文件到目录
	router.POST("/upload", func(c *gin.Context) {
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		files := form.File["file"]

		if len(files) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无文件被上传"})
			return
		}

		for _, file := range files {
			uploadPath := filepath.Join("uploads", file.Filename)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "文件成功上传"})
	})

	// GET /download?filename= 下载指定文件
	router.GET("/download", func(c *gin.Context) {
		filename := c.Query("filename")
		if filename == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "需要文件名"})
			return
		}

		filePath := filepath.Join("uploads", filename)
		fileInfo, err := os.Stat(filePath)
		if err != nil {
			if os.IsNotExist(err) {
				c.JSON(http.StatusNotFound, gin.H{"error": "未找到文件"})
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "文件错误"})
			}
			return
		}

		// 使用 c.FileAttachment 并传递原始文件名作为第二个参数
		c.FileAttachment(filePath, filename)

		// 设置 Content-Length 头部以优化下载体验
		c.Writer.Header().Set("Content-Length", strconv.FormatInt(fileInfo.Size(), 10))
	})

	// POST /clipboard 存入剪贴板
	initDB()
	defer db.Close()
	router.POST("/clipboard", func(c *gin.Context) {
		// Get the context from the form data
		context := c.PostForm("context")
		if context == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "需要文字"})
			return
		}

		// Insert the context into the clipboard table
		_, err := db.Exec("INSERT INTO clipboard (context) VALUES (?)", context)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, gin.H{"message": "剪贴板记录已创建"})
	})

	type ClipboardEntry struct {
		ID      int       `json:"id"`
		Context string    `json:"context"`
		Time    time.Time `json:"time"`
	}
	// GET /clipboard/info 获取剪贴板
	router.GET("/clipboard/info", func(c *gin.Context) {
		// Query the clipboard table to get all entries
		rows, err := db.Query("SELECT id, context, time FROM clipboard")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer func(rows *sql.Rows) {
			err := rows.Close()
			if err != nil {
				panic(err)
			}
		}(rows)

		// Create a slice to hold the clipboard entries
		var entries []ClipboardEntry

		// Iterate over the rows and add each entry to the slice
		for rows.Next() {
			var entry ClipboardEntry
			err := rows.Scan(&entry.ID, &entry.Context, &entry.Time)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			entries = append(entries, entry)
		}

		// Check for any errors during iteration
		if err := rows.Err(); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// Return the entries as JSON
		c.JSON(http.StatusOK, gin.H{"data": entries})
	})

	router.DELETE("/clipboard/delete", func(c *gin.Context) {
		// Get the ID from the query parameter
		idStr := c.Query("id")
		if idStr == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请求需要ID"})
			return
		}

		// Convert the ID string to an integer
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "无效ID"})
			return
		}

		// Execute the DELETE statement
		_, err = db.Exec("DELETE FROM clipboard WHERE id = ?", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Return a success message
		c.JSON(http.StatusOK, gin.H{"message": "剪贴板数据已经删除"})
	})

	router.Run(":8080")
}
