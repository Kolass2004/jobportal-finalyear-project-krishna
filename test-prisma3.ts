try {
  const lib = require('@libsql/client');
  console.log("libsql is installed!");
} catch(e) { console.log(e.message); }

try {
  const lib2 = require('@prisma/adapter-libsql');
  console.log("adapter-libsql is installed!");
} catch(e) { console.log(e.message); }

try {
  const lib3 = require('better-sqlite3');
  console.log("better-sqlite3 is installed!");
} catch(e) { console.log(e.message); }
