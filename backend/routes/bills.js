const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.post("/bills", upload.single("bill"), async (req, res) => {
  await prisma.groceryBill.create({
    data: { adminId: 1, filePath: req.file.path, amount: parseFloat(req.body.amount) }
  });
  res.json({ message: "Bill uploaded successfully" });
});
