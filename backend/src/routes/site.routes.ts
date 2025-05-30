// src/routes/site.routes.ts
import { Router } from 'express';
import { SiteController } from '../controllers/site.controller';
import { upload } from '../middlewares/upload.middleware';

const router = Router();
const siteController = new SiteController();

// Test endpoint
router.get("/test", siteController.test);

// Preview site
router.post("/preview-site", upload.single("file"), siteController.previewSite);

// Create site
router.post("/create-site", upload.single("file"), siteController.createSite);

// Update site
router.put("/update-site", upload.single("file"), siteController.updateSite);

// transfer owner
router.put("/transfer-owner", siteController.transferOwner);

// grant access
router.put("/grant-access", siteController.grantAccess);

// Set attributes
router.put("/set-attributes", siteController.setAttributes);

// Add site ID
router.put("/add-site-id", siteController.addSiteId);

// Delete site
router.delete("/delete-site", siteController.deleteSite);


export default router;