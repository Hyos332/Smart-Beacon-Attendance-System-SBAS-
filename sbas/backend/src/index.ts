import express, { Request, Response } from "express";
import cors from "cors";
import attendanceRoutes from "./routes/attendance";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/attendance", attendanceRoutes);

app.get("/", (req: Request, res: Response) => res.send("SBAS Backend OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
