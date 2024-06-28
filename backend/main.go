package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Print the current working directory for debugging
	wd, err := os.Getwd()
	if err != nil {
		panic(err)
	}
	fmt.Println("Current working directory:", wd)

	router := gin.Default()

	// Allow all origins
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "No files uploaded"})
			return
		}

		for _, file := range files {
			uploadPath := filepath.Join("uploads", file.Filename)
			if err := c.SaveUploadedFile(file, uploadPath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}

		c.JSON(http.StatusOK, gin.H{"message": "Files uploaded successfully!"})
	})

	// GET /download?filename= 下载指定文件
	router.GET("/download", func(c *gin.Context) {
		filename := c.Query("filename")
		if filename == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Filename is required"})
			return
		}

		filePath := filepath.Join("uploads", filename)
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
			return
		}

		c.File(filePath)
	})

	router.Run(":8080")
}
