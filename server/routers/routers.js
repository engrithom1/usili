const express = require("express");
const router = express.Router();

const mainController = require("../controllers/mainController");
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const packageController = require("../controllers/packageController");
const branchController = require("../controllers/branchController");
const barcodeController = require("../controllers/barcodeController");

const upload = require("../middleware/uploadsMiddleware");

const checker = require("../middleware/authMiddleware");
const deleteFile = require("../middleware/deleteFilesMiddleware");

/////packages/////////////////////////////////////////// 
router.get("/add-package",checker.authChecker, packageController.addPackage);
router.get("/incoming-packages",checker.authChecker, packageController.incomingPackages);
router.get("/outgoing-packages",checker.authChecker, packageController.outgoingPackages);

router.get("/bm-received-reports",checker.authBm, packageController.bmReceivedReports);
router.get("/received-reports",checker.authSuper, packageController.receivedReports);
router.get("/transit-reports",checker.authSuper, packageController.transitReports);
router.get("/revenue-report",checker.authSuper, packageController.revenueReports);
router.get("/removed-packages",checker.authSuper, packageController.removedReports);
/////revenueReports


// router.post("/create-package",upload.imageUpload.single("thumbnail"), packageController.createPackage);
router.post("/create-package",checker.authChecker, packageController.createPackage);
router.post("/remove-package",checker.authChecker, packageController.removePackage);
router.post("/update-package",checker.authChecker, packageController.updatePackage);
router.post("/receive-package",checker.authChecker, packageController.receivePackage);
router.post("/redirect-package",checker.authChecker, packageController.redirectPackage);

router.post("/filter-outgoing-package",checker.authChecker, packageController.filterOutgoingPackages);
router.post("/filter-incoming-package",checker.authChecker, packageController.filterIncomingPackages);
router.post("/filter-transit-packages",checker.authSuper, packageController.filterTransitPackages);
router.post("/filter-removed-packages",checker.authSuper, packageController.filterRemovedPackages);
router.post("/filter-received-packages",checker.authSuper, packageController.filterReceivedPackages);
router.post("/filter-bm-received-packages",checker.authBm, packageController.filterBmReceivedPackages);
router.post("/filter-revenue-packages",checker.authSuper, packageController.filterRevenueReports);

///messages/////////// /send-multi-sms
router.post("/filter-receiver-phones",checker.authChecker, packageController.filterReceiverPhones);
router.post("/send-multi-sms",checker.authChecker, packageController.sendMultSMS);
router.post("/pdf-outgoing-package",checker.authChecker, packageController.pdfOutgoingPackages);
/////staff & customer & transporter
router.get("/staff-members",checker.authChecker, userController.staffMembers);
router.post("/create-staff",checker.authChecker, userController.createStaffMember);
router.post("/edit-staff",checker.authChecker, userController.updateStaffMember);
router.post("/filter-staff-branch",checker.authChecker, userController.filterStaffMembers);
router.post("/delete-staff", checker.authChecker, userController.deleteStaff);

router.get("/customers",checker.authChecker, userController.customers);
router.get("/customer/:phone",checker.authChecker, userController.customerEvents);
/*router.post("/get-edit-user", checker.authChecker, userController.getUserEdit);
router.post("/update/user", checker.authChecker,userController.updateUser);*/


/////brances /get-edit-branch
router.get("/deport-branches",checker.authSuper, branchController.deportBranches);
router.post("/create-branch",upload.imageUpload.single("thumbnail"), branchController.createBranch);
router.post("/get-edit-branch",checker.authChecker, branchController.getEditBranch); 
router.post("/get-view-branch",checker.authSuper, branchController.getViewBranch);
router.post("/update-branch",checker.authSuper,upload.imageUpload.single("thumbnail"), branchController.updateBranch);
router.post("/delete-branch",checker.authSuper, branchController.deleteBranch); 

//////barcode  
router.get("/generate-code",checker.authManagers, barcodeController.genBarcode);
router.get("/print-code",checker.authManagers, barcodeController.printBarcode);
router.post("/code-generator",checker.authChecker, barcodeController.barcodeGenerator);
router.post("/save-barcodes",checker.authChecker, barcodeController.saveBarcode);
router.post("/remove-barcodes",checker.authChecker, barcodeController.removeBarcode);
router.post("/print-barcode-pdf",checker.authChecker,deleteFile.deleteAllPdf, barcodeController.printBarcodeDPF);
router.post("/find-barcode-valid",checker.authChecker, barcodeController.findBarcodeValid);
router.post("/find-onuse-barcode-remove",checker.authChecker, barcodeController.findOnuseBarcodeRemove);
router.post("/find-onuse-barcode-edit",checker.authChecker, barcodeController.findOnuseBarcodeEdit);
router.post("/find-onuse-barcode-receive",checker.authChecker, barcodeController.findOnuseBarcodeReceive);
router.post("/find-onuse-barcode-hanging",checker.authChecker, barcodeController.findOnuseBarcodeHanging);

///constroller for main pages /building-construction
router.get("/", checker.authChecker, mainController.adminPage);
router.get("/profile",checker.authChecker, mainController.profile);
router.get("/package-receipt",checker.authChecker, mainController.receipt);
router.get("/notification",checker.authChecker, mainController.notification);
//router.get("/dashbord", checker.authChecker, mainController.adminPage);

///authControll router
router.get("/login", checker.sessionChecker, authController.loginForm);
router.get("/register", checker.sessionChecker, authController.registerForm);
router.post("/login", authController.login);
router.post("/get-password", authController.login);
router.post("/register", authController.register);
router.get("/logout", authController.logout);
router.post("/forget-password", authController.forgetPassword);
router.post("/change-password", authController.changePassword);

module.exports = router;
