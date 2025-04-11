
# 🎵 MoodMusic

**MoodMusic** is an innovative web application that curates personalized music playlists based on your current mood. By leveraging mood detection algorithms, it enhances your listening experience, ensuring that the music resonates with your emotional state.

🔗 **Live Demo**: [themoodmusic.netlify.app](https://themoodmusic.netlify.app)

---

## 🚀 Features

- **Mood-Based Playlists**: Receive music recommendations tailored to your current mood.
- **User-Friendly Interface**: Navigate effortlessly through a sleek and intuitive design.
- **Real-Time Mood Detection**: Analyze user input to determine mood and suggest appropriate tracks.
- **Responsive Design**: Enjoy a seamless experience across all devices.
- **Secure Authentication**: Register and log in to save your preferences and playlists.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, HTML5, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Containerization**: Docker
- **Deployment**: Netlify (Frontend), Vercel (Backend)

---

## 🧪 Getting Started

### Prerequisites

- Node.js (v14 or above)
- Docker
- MongoDB

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/HritamBrahmachari/Moodmusic.git
   cd Moodmusic
   ```

2. **Setup Environment Variables**

   Create a `.env` file in the `backend/` directory with the following content:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. **Run with Docker**

   ```bash
   docker build -t moodmusic .
   docker run -p 3000:3000 moodmusic
   ```

4. **Access the Application**

   Open your browser and navigate to `http://localhost:3000` to use MoodMusic locally.

---

## 🧑‍💻 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
