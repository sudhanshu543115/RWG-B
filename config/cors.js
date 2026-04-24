const corsOptions = {
    origin: ["http://localhost:5173", "http://localhost:3000", "https://rwg-tourist.vercel.app", "https://rwg-rider.vercel.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
};

export default corsOptions;
