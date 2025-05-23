import express from "express";
import multer from "multer";
import { Request } from "express";
import { preview } from "../controllers/userController";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, 'uploads/');
  },
  filename: function (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post("/", upload.single("file"), preview);

module.exports = router;