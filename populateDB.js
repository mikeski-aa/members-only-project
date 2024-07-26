const pool = require("./config/pool");

function populateDB() {
  pool.query(`UPDATE users SET isadmin = true WHERE username = 'Super';`);
}

populateDB();

// session setup
// `CREATE TABLE "session" (
//     "sid" varchar NOT NULL COLLATE "default",
//     "sess" json NOT NULL,
//     "expire" timestamp(6) NOT NULL
//   )
//   WITH (OIDS=FALSE);

//   ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

//   CREATE INDEX "IDX_session_expire" ON "session" ("expire");`

// posts setup
// `CREATE TABLE "posts" (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, message TEXT, date DATE, user_id INTEGER);`

// users setup
// `CREATE TABLE "users" (id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, username VARCHAR (255), hash VARCHAR (255), salt VARCHAR (255), firstname VARCHAR (255), lastname VARCHAR (255), isadmin BOOLEAN NOT NULL, memberstatus BOOLEAN NOT NULL);`;
