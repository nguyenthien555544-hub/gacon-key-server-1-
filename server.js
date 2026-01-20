const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/*
 KEY STRUCT:
 {
   key: "ABC123",
   type: "FREE" | "VIP",
   exp: timestamp,
   device: null | "fingerprint"
 }
*/

let KEYS = [];

/* ========== ADMIN CREATE KEY ========== */
app.post("/admin/create", (req, res) => {
  const { key, type, hours } = req.body;
  if (!key) return res.json({ ok: false });

  KEYS.push({
    key,
    type: type || "FREE",
    exp: Date.now() + (hours || 24) * 3600000,
    device: null
  });

  res.json({ ok: true });
});

/* ========== CHECK KEY ========== */
app.post("/check", (req, res) => {
  const { key, device } = req.body;
  const k = KEYS.find(x => x.key === key);

  if (!k) return res.json({ ok: false, msg: "KEY SAI" });
  if (Date.now() > k.exp) return res.json({ ok: false, msg: "KEY HẾT HẠN" });

  if (!k.device) k.device = device;
  if (k.device !== device)
    return res.json({ ok: false, msg: "KEY ĐÃ DÙNG MÁY KHÁC" });

  res.json({
    ok: true,
    type: k.type,
    exp: k.exp
  });
});

/* ========== STAT ========== */
app.get("/stat", (req, res) => {
  res.json({
    total: KEYS.length,
    online: KEYS.filter(k => Date.now() < k.exp).length
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("KEY SERVER RUNNING"));
