const express = require('express');
const fs = require('fs');
const users = require("./MOCK_DATA.json");
const app = express();
const PORT = 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // To parse JSON request bodies

// Routes

// Get all users
app.get("/api/users", (req, res) => {
    return res.json(users);
});

// Display users as HTML
app.get('/users', (req, res) => {
    const html = `
    <ul>
        ${users.map(user => `<li>${user.first_name}</li>`).join("")}
    </ul>`;
    res.send(html);
});

// Get a single user by ID
app.get("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const user = users.find(user => user.id === id);
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
});

// Create a new user
app.post("/api/users", (req, res) => {
    const body = req.body;
    if (!body.first_name || !body.last_name || !body.email) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const newUser = { ...body, id: users.length + 1 };
    users.push(newUser);

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to save data" });
        }
        return res.json({ status: "success", id: newUser.id });
    });
});

// Update a user (PATCH)
app.patch("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users[userIndex] = { ...users[userIndex], ...req.body };

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to update user" });
        }
        return res.json({ status: "success", user: users[userIndex] });
    });
});

// Delete a user (DELETE)
app.delete("/api/users/:id", (req, res) => {
    const id = Number(req.params.id);
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
    }

    users.splice(userIndex, 1);

    fs.writeFile("./MOCK_DATA.json", JSON.stringify(users, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to delete user" });
        }
        return res.json({ status: "success", message: "User deleted" });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server started at PORT : ${PORT}`));


