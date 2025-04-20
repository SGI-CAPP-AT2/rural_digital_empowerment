import { auth } from "../firebase/firebase";

// api.js
const API_BASE = "https://prabal-backend.onrender.com"; // Change if deployed elsewhere

async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");
  return await user.getIdToken();
}

async function request(path, method = "POST", body = {}, isFile = false) {
  const token = await getAuthToken();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  let payload;

  if (isFile) {
    payload = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      payload.append(key, value);
    });
  } else {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: payload,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response.json().catch(() => ({})); // in case response has no JSON
}

// Add user (no auth needed)
export async function addUser(uname) {
  const response = await fetch(`${API_BASE}/add_user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uname }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.text();
}

// Create room
export async function createRoom({ title, teacher, description }) {
  return await request("/create_room", "POST", { title, teacher, description });
}

// Join room
export async function joinRoom(uname, code) {
  return await request("/join_room", "POST", { uname, code });
}

// Upload post (with file)
export async function uploadPost({ code, content, file }) {
  return await request("/upload", "POST", { code, content, file }, true);
}

// Get posts in a room
export async function getPosts(code) {
  return await request("/posts", "POST", { code });
}

// Create announcement
export async function createAnnouncement({ code, title, description }) {
  return await request("/announce", "POST", { code, title, description });
}

// Get announcements
export async function getAnnouncements(code) {
  return await request("/getAnnouncements", "POST", { code });
}

// Get all rooms a user has joined (no auth required)
export async function getMyRooms(uname) {
  if (!uname) throw new Error("Username is required");

  const response = await fetch(
    `${API_BASE}/roomsof/${encodeURIComponent(uname)}`
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json(); // Returns array of room objects
}

// Get room details
export async function getRoomDetails(code) {
  const response = await fetch(`${API_BASE}/room/${encodeURIComponent(code)}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return await response.json(); // { title, description, teacher }
}

export function getBase() {
  return API_BASE;
}
