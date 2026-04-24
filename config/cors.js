const corsOptions = {
    origin: ["http://localhost:5173", "https://rwg-tourist.vercel.app"], // Don't use "*"
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};


export default corsOptions;
