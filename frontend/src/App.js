import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Corrected import
import { TextField, Button, Container, Typography, Paper } from "@mui/material";

const API_URL = "https://your-api.onrender.com";  

function App() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [blog, setBlog] = useState("");
    const [topic, setTopic] = useState("");
    const [blogs, setBlogs] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    const fetchBlogs = useCallback(async () => {
        if (!token) return;

        try {
            const response = await axios.get(`${API_URL}/blogs`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBlogs(response.data.blogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    }, [token]);

    useEffect(() => {
       fetchBlogs();
    }, [fetchBlogs]);

    const handleSignup = async () => {
        try {
            await axios.post(`${API_URL}/signup`, { username, password });
            alert("Signup successful! Please log in.");
        } catch (error) {
            alert("Signup failed. Username may already exist.");
        }
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_URL}/login`, { username, password });
            const accessToken = response.data.access_token;
            localStorage.setItem("token", accessToken);
            setToken(accessToken);
        } catch (error) {
            alert("Invalid username or password.");
        }
    };

    const handleGenerateBlog = async () => {
        if (!token) {
            alert("Please log in first!");
            return;
        }

        if (isGenerating) return;

        setIsGenerating(true);

        try {
            const response = await axios.post(
                `${API_URL}/generate`,
                { topic },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBlog(response.data.blog);
            fetchBlogs();
        } catch (error) {
            alert("Failed to generate blog. Please log in again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken("");
        alert("Logged out successfully!");
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} style={{ padding: "20px", marginTop: "50px", textAlign: "center", backgroundColor: "#e0f7fa" }}>
                <Typography variant="h4" gutterBottom>AI Blog Generator</Typography>

                {!token ? (
                    <div>
                        <TextField label="Username" fullWidth value={username} onChange={(e) => setUsername(e.target.value)} style={{ marginBottom: "10px" }} />
                        <TextField label="Password" type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} style={{ marginBottom: "10px" }} />
                        <Button variant="contained" color="primary" fullWidth onClick={handleSignup} style={{ marginBottom: "10px" }}>Signup</Button>
                        <Button variant="contained" color="secondary" fullWidth onClick={handleLogin}>Login</Button>
                    </div>
                ) : (
                    <div>
                        <Typography variant="h6">Welcome, {jwtDecode(token).sub}!</Typography>
                        <TextField label="Enter blog topic" fullWidth value={topic} onChange={(e) => setTopic(e.target.value)} style={{ marginBottom: "10px" }} />
                        <Button variant="contained" color="primary" fullWidth onClick={handleGenerateBlog} disabled={isGenerating}>
                            {isGenerating ? "Generating..." : "Generate Blog"}
                        </Button>
                        {blog && (
                            <Paper elevation={2} style={{ padding: "10px", marginTop: "20px", textAlign: "left" }}>
                                <Typography variant="h6">Generated Blog:</Typography>
                                <Typography variant="body1">{blog}</Typography>
                            </Paper>
                        )}
                        <Typography variant="h6" style={{ marginTop: "20px" }}>Your Blogs:</Typography>
                        {blogs.map((b, index) => (
                            <Paper key={index} elevation={2} style={{ padding: "10px", marginTop: "10px" }}>
                                <Typography variant="h6">{b.topic}</Typography>
                                <Typography variant="body1">{b.content}</Typography>
                            </Paper>
                        ))}
                        <Button variant="contained" color="error" fullWidth onClick={handleLogout} style={{ marginTop: "20px" }}>Logout</Button>
                    </div>
                )}
            </Paper>
        </Container>
    );
}

export default App;

