const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const app = express();
app.use(bodyParser.json());

const port = 3000;
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "hozu",
});

app.post("/posts", (req, res) => {
  pool.query(
    "insert into post(title, author, createdAt, content) values (?, ?, NOW(), ?)",
    [req.body.title, req.body.author, req.body.content],
    (err, rows, fields) => {
      if (err) res.status(400).send(err);
      else res.send("ok");
    }
  );
});

app.post("/api/user", (req, res) => {
  bcrypt.hash(req.body.password, SALT_ROUNDS, (err, hash) => {
    pool.query(
      "insert into user (email, password, name, roles, created_at) values (?, ?, ?, ?, NOW())",
      [req.body.email, hash, req.body.name, req.body.roles],
      (err, rows, fields) => {
        if (err) res.status(400).send(err);
        else res.send("ok");
      }
    );
  });
});

app.get("/posts", (req, res) => {
  pool.query("select * from post", (err, rows, fields) => {
    res.json(rows);
  });
});

app.get("/api/user", (req, res) => {
  pool.query("select * from user", (err, rows, fields) => {
    res.json(rows);
  });
});

app.get("/posts/:id", (req, res) => {
  const id = req.params.id;
  pool.query("select * from post where id = ?", [id], (err, rows, fields) => {
    if (rows.length == 0) res.status(404).send("null");
    else res.json(rows[0]);
  });
});

app.get("/api/user/:id", (req, res) => {
  const id = req.params.id;
  pool.query("select * from user where id = ?", [id], (err, rows, fields) => {
    if (rows.length == 0) res.status(404).send("null");
    else res.json(rows[0]);
  });
});

app.delete("/posts/:id", (req, res) => {
  const id = req.params.id;
  pool.query("delete from post where id = ?", [id], (err, rows, fields) => {
    if (rows.affectedRows === 0) res.status(404).send("null");
    else res.json(ok);
  });
});

app.delete("/api/user/:id", (req, res) => {
  const id = req.params.id;
  pool.query("delete from user where id = ?", [id], (err, rows, fields) => {
    if (rows.affectedRows === 0) res.status(404).send("null");
    else res.json(ok);
  });
});

app.patch("/posts/:id", (req, res) => {
  const id = req.params.id;
  pool.query("select * from post where id = ?", [id], (err, rows, fields) => {
    if (rows.length == 0) res.status(404).send("null");
    else {
      delete req.body.id;
      const modified = Object.assign(rows[0], req.body); // Object.assign : 두번째 파라미터(변경할 값) -> 첫번째 파라미터(원본)으로 merge
      pool.query(
        "update post set title = ?, author = ?, content = ? where id = ?",
        [modified.title, modified.author, modified.content, id],
        (err, rows, fields) => {
          if (err) res.status(400).send("null");
          else res.send("ok");
        }
      );
    }
  });
});

app.patch("/api/user/:id", (req, res) => {
  const id = req.params.id;
  pool.query("select * from user where id = ?", [id], (err, rows, fields) => {
    if (rows.length == 0) res.status(404).send("null");
    else {
      delete req.body.id;
      const modified = Object.assign(rows[0], req.body);
      pool.query(
        "update user set password = ?, name = ?, roles = ? where id = ?",
        [modified.password, modified.name, modified.roles, id],
        (err, rows, fields) => {
          if (err) res.status(400).send("null");
          else res.send("ok");
        }
      );
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
