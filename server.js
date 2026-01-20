const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/* ===== CONFIG ===== */
const ADMIN_PASSWORD = "123456"; // đổi mật khẩu ở đây

/* ===== DATABASE TẠM (RAM) ===== */
const KEYS = {}; 
// key: { type, expire, ip }

/* ===== ROOT ===== */
app.get("/", (req, res) => {
  res.send("🚀 GACON KEY SERVER RUNNING");
});

/* ===== ADMIN WEB ===== */
app.get("/admin", (req, res) => {
  res.send(`
  <h2>Gacon Key Admin</h2>
  <input id="pass" placeholder="Admin password"><br><br>
  <input id="key" placeholder="Key"><br>
  <select id="type">
    <option>FREE</option>
    <option>VIP</option>
  </select>
  <input id="hour" placeholder="Expire (hours)" type="number"><br><br>
  <button onclick="create()">Create Key</button>
  <button onclick="remove()">Delete Key</button>

  <pre id="log"></pre>

  <script>
    function create(){
      fetch("/admin/create",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          pass:pass.value,
          key:key.value,
          type:type.value,
          hour:hour.value
        })
      }).then(r=>r.json()).then(d=>log.textContent=JSON.stringify(d,null,2))
    }

    function remove(){
      fetch("/admin/delete",{
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          pass:pass.value,
          key:key.value
        })
      }).then(r=>r.json()).then(d=>log.textContent=JSON.stringify(d,null,2))
    }
  </script>
  `);
});

/* ===== CREATE KEY ===== */
app.post("/admin/create", (req, res) => {
  const { pass, key, type, hour } = req.body;
  if (pass !== ADMIN_PASSWORD) return res.json({ ok:false });

  KEYS[key] = {
    type,
    expire: Date.now() + hour * 3600000,
    ip: null
  };

  res.json({ ok:true, KEYS });
});

/* ===== DELETE KEY ===== */
app.post("/admin/delete", (req, res) => {
  const { pass, key } = req.body;
  if (pass !== ADMIN_PASSWORD) return res.json({ ok:false });

  delete KEYS[key];
  res.json({ ok:true });
});

/* ===== BOT CHECK KEY ===== */
app.get("/check", (req, res) => {
  const { key } = req.query;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  if (!KEYS[key]) return res.json({ ok:false, msg:"Key không tồn tại" });

  const data = KEYS[key];

  if (Date.now() > data.expire)
    return res.json({ ok:false, msg:"Key hết hạn" });

  if (!data.ip) data.ip = ip;
  if (data.ip !== ip)
    return res.json({ ok:false, msg:"Key đang dùng máy khác" });

  res.json({
    ok:true,
    type:data.type
  });
});

/* ===== START ===== */
app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
