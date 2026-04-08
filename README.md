
# 🎵 MoodMusic

**MoodMusic** is an innovative web application that curates personalized music playlists based on your current mood. By leveraging mood detection algorithms, it enhances your listening experience, ensuring that the music resonates with your emotional state.


## 🚀 Features

- **Song Lyrics Search**: Search and view complete song lyrics directly on the site (NEW!)
  - Powers: Lyrics.ovh API (80% hit rate for popular songs)
  - Example: "Bohemian Rhapsody", "Shape of You", "Bad Guy"
- **Mood-Based Playlists**: Receive music recommendations tailored to your current mood.
- **User-Friendly Interface**: Navigate effortlessly through a sleek and intuitive design.
- **Real-Time Mood Detection**: Analyze user input to determine mood and suggest appropriate tracks.
- **Responsive Design**: Enjoy a seamless experience across all devices.
- **Secure Authentication**: Register and log in to save your preferences and playlists.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, HTML5, CSS3, CSS Modules
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **APIs**: Mistral AI, Lyrics.ovh, YouTube
- **Containerization**: Docker
- **Deployment**: Netlify (Frontend), Vercel (Backend)

⚠️ Note: Project has migrated from MongoDB to PostgreSQL!

### Prerequisites

- Node.js (v18 or above)
- npm
- PostgreSQL

### Windows Installation (Local Setup)

#### 1. **Clone the Repository**
```cmd
cd moodmusic
```

#### 2. **Setup Environment Variables**

Create a .env file in the `backend/` directory:
```env
DATABASE_URL=your_postgreSQL_connection_string
JWT_SECRET=your_secret_key
MISTRAL_API_KEY=your_mistral_key
```

💡 **Get PostgreSQL:** Sign up at https://supabase.com/ or use local install

#### 3. **Setup PostgreSQL (Windows Users)**
!!! Supabase uses PostgreSQL!!!
```cmd
# Install dependencies (bash these in Windows)
cd backend
npm install
```

#### 4. **Run Database Migrations**
```cmd
cd backend
npx prisma generate
npx prisma migrate dev
```

#### 5. **Start Development Servers**
```cmd
# In first terminal (backend)
cd backend
npm run dev
# Wait for "Server running on port 5000"

# In second terminal (frontend)
cd frontend
npm install
npm run dev
```

Now visit `http://localhost:5173`

5. **Access the Application**

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
