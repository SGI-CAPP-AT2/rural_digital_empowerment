package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

const (
	dbName       = "local_user.db"
	udpPort      = 9999
	httpPort     = ":8080"
	broadcastInt = 5 * time.Minute
	uploadDir    = "./uploads"
)

var mu sync.Mutex

func main() {
	os.MkdirAll(uploadDir, os.ModePerm)
	db := initDB()
	defer db.Close()

	go startUDPListener(db)
	go func() {
		for {
			broadcastRooms(db)
			time.Sleep(broadcastInt)
		}
	}()

	http.HandleFunc("/join_room", func(w http.ResponseWriter, r *http.Request) {
		handleJoinRoom(w, r, db)
	})
	http.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		handleUploadPost(w, r, db)
	})
	http.HandleFunc("/posts", func(w http.ResponseWriter, r *http.Request) {
		handleGetPosts(w, r, db)
	})
	http.HandleFunc("/announce", func(w http.ResponseWriter, r *http.Request) {
		handleAnnounce(w, r, db)
	})
	http.HandleFunc("/getAnnouncements", func(w http.ResponseWriter, r *http.Request) {
		handleGetAnnouncements(w, r, db)
	})
	http.HandleFunc("/roomsof", func(w http.ResponseWriter, r *http.Request) {
		handleGetJoinedRooms(w, r, db)
	})
	http.HandleFunc("/room", func(w http.ResponseWriter, r *http.Request) {
		handleGetRoomByID(w, r, db)
	})
	log.Println("Server listening on", httpPort)
	log.Fatal(http.ListenAndServe(httpPort, enableCORS(http.DefaultServeMux)))
}

func enableCORS(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Adjust these headers as needed for your frontend
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight request
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		h.ServeHTTP(w, r)
	})
}


// --- DB Setup & Models ---

func initDB() *sql.DB {
	db, err := sql.Open("sqlite", dbName)
	if err != nil {
		log.Fatal(err)
	}

	create := func(query string) {
		if _, err := db.Exec(query); err != nil {
			log.Fatal(err)
		}
	}

	create(`CREATE TABLE IF NOT EXISTS rooms (
		id TEXT PRIMARY KEY,
		title TEXT,
		description TEXT,
		teacher TEXT
	);`)
	create(`CREATE TABLE IF NOT EXISTS posts (
		id TEXT PRIMARY KEY,
		code TEXT,
		content TEXT,
		file_url TEXT
	);`)
	create(`CREATE TABLE IF NOT EXISTS announcements (
		id TEXT PRIMARY KEY,
		code TEXT,
		title TEXT,
		description TEXT
	);`)

	return db
}

// --- Handlers ---

func handleJoinRoom(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "POST" {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}
	var body struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Teacher     string `json:"teacher"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}
	mu.Lock()
	defer mu.Unlock()
	_, err := db.Exec("INSERT OR IGNORE INTO rooms (id, title, description, teacher) VALUES (?, ?, ?, ?)",
		body.ID, body.Title, body.Description, body.Teacher)
	if err != nil {
		http.Error(w, "Failed to join room", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Joined room"))
}

func handleUploadPost(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	if r.Method != "POST" {
		http.Error(w, "Invalid method", http.StatusMethodNotAllowed)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, fmt.Sprintf("Error parsing form: %v", err), http.StatusBadRequest)
		return
	}

	id := r.FormValue("id")
	var exists bool
	err = db.QueryRow("SELECT EXISTS(SELECT 1 FROM posts WHERE id = ?)", id).Scan(&exists)

	if exists {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Post uploaded successfully"))
		return
	}
	code := r.FormValue("code")
	content := r.FormValue("content")

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, fmt.Sprintf("Error getting file: %v", err), http.StatusBadRequest)
		return
	}
	defer file.Close()

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), header.Filename)
	filepath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(filepath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error saving file: %v", err), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, fmt.Sprintf("Error writing file: %v", err), http.StatusInternalServerError)
		return
	}

	mu.Lock()
	defer mu.Unlock()
	_, err = db.Exec("INSERT OR IGNORE INTO posts (id, code, content, file_url) VALUES (?, ?, ?, ?)", id, code, content, filepath)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error storing post in db: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Post uploaded successfully"))
}


func handleGetPosts(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var req struct {
		Code string `json:"code"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	rows, err := db.Query("SELECT id, content, file_url FROM posts WHERE code = ?", req.Code)
	if err != nil {
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var posts []map[string]string
	for rows.Next() {
		var id, content, file string
		rows.Scan(&id, &content, &file)
		posts = append(posts, map[string]string{
			"id":      id,
			"content": content,
			"fileUrl": file,
		})
	}
	json.NewEncoder(w).Encode(posts)
}

func handleAnnounce(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var a struct {
		ID          string `json:"id"`
		Code        string `json:"code"`
		Title       string `json:"title"`
		Description string `json:"description"`
	}
	json.NewDecoder(r.Body).Decode(&a)
	mu.Lock()
	defer mu.Unlock()
	_, err := db.Exec("INSERT OR IGNORE INTO announcements (id, code, title, description) VALUES (?, ?, ?, ?)",
		a.ID, a.Code, a.Title, a.Description)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error storing an in db: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Announcement created"))
}

func handleGetAnnouncements(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	var req struct {
		Code string `json:"code"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	rows, err := db.Query("SELECT id, title, description FROM announcements WHERE code = ?", req.Code)
	if err != nil {
		http.Error(w, "Failed to fetch announcements", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var result []map[string]string
	for rows.Next() {
		var id, title, desc string
		rows.Scan(&id, &title, &desc)
		result = append(result, map[string]string{
			"id":          id,
			"title":       title,
			"description": desc,
		})
		print(id, title, desc)
	}
	json.NewEncoder(w).Encode(result)
}

func handleGetJoinedRooms(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	rows, err := db.Query("SELECT id, title, description, teacher FROM rooms")
	if err != nil {
		http.Error(w, "Error fetching rooms"+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()
	var rooms []map[string]string
	for rows.Next() {
		var id, title, desc, teacher string
		rows.Scan(&id, &title, &desc, &teacher)
		rooms = append(rooms, map[string]string{
			"id":          id,
			"title":       title,
			"description": desc,
			"teacher":     teacher,
		})
	}
	json.NewEncoder(w).Encode(rooms)
}


// --- UDP Sharing ---

func broadcastRooms(db *sql.DB) {
	rows, _ := db.Query("SELECT id FROM rooms")
	var codes []string
	for rows.Next() {
		var c string
		rows.Scan(&c)
		codes = append(codes, c)
	}
	payload, _ := json.Marshal(codes)

	broadcastAddr := &net.UDPAddr{IP: net.IPv4bcast, Port: udpPort}
	conn, err := net.DialUDP("udp", nil, broadcastAddr)
	if err != nil {
		log.Println("Broadcast error:", err)
		return
	}
	defer conn.Close()
	conn.Write(payload)
}

func startUDPListener(db *sql.DB) {
	addr := &net.UDPAddr{IP: net.IPv4zero, Port: udpPort}
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	buf := make([]byte, 2048)
	for {
		n, remoteAddr, _ := conn.ReadFromUDP(buf)
		go handleUDPMessage(buf[:n], remoteAddr, db)
	}
}

func handleUDPMessage(data []byte, remote *net.UDPAddr, db *sql.DB) {
	var codes []string
	if err := json.Unmarshal(data, &codes); err != nil {
		return
	}

	for _, code := range codes {
		url := fmt.Sprintf("http://%s:8080/posts", remote.IP)
		fetchAndInsertPosts(db, url, code)

		url = fmt.Sprintf("http://%s:8080/getAnnouncements", remote.IP)
		fetchAndInsertAnnouncements(db, url, code)
	}
}

func fetchAndInsertPosts(db *sql.DB, url string, code string) {
	body := strings.NewReader(fmt.Sprintf(`{"code":"%s"}`, code))
	resp, err := http.Post(url, "application/json", body)
	if err != nil {
		log.Println("Post sync error:", err)
		return
	}
	defer resp.Body.Close()

	var posts []map[string]string
	json.NewDecoder(resp.Body).Decode(&posts)
	for _, p := range posts {
		mu.Lock()
		db.Exec("INSERT OR IGNORE INTO posts (id, code, content, file_url) VALUES (?, ?, ?, ?)",
			p["id"], code, p["content"], p["fileUrl"])
		mu.Unlock()
	}
}

func fetchAndInsertAnnouncements(db *sql.DB, url string, code string) {
	body := strings.NewReader(fmt.Sprintf(`{"code":"%s"}`, code))
	resp, err := http.Post(url, "application/json", body)
	if err != nil {
		log.Println("Announce sync error:", err)
		return
	}
	defer resp.Body.Close()

	var anns []map[string]string
	json.NewDecoder(resp.Body).Decode(&anns)
	for _, a := range anns {
		mu.Lock()
		db.Exec("INSERT OR IGNORE INTO announcements (id, code, title, description) VALUES (?, ?, ?, ?)",
			a["id"], code, a["title"], a["description"])
		mu.Unlock()
	}
}
func handleGetRoomByID(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing id parameter", http.StatusBadRequest)
		return
	}
	row := db.QueryRow("SELECT id, title, description, teacher FROM rooms WHERE id = ?", id)
	var room struct {
		ID          string `json:"id"`
		Title       string `json:"title"`
		Description string `json:"description"`
		Teacher     string `json:"teacher"`
	}
	err := row.Scan(&room.ID, &room.Title, &room.Description, &room.Teacher)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Room not found", http.StatusNotFound)
		} else {
			http.Error(w, "Database error", http.StatusInternalServerError)
		}
		return
	}
	json.NewEncoder(w).Encode(room)
}

