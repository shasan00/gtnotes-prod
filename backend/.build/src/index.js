"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const pool_1 = require("./db/pool");
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
(0, pool_1.initDb)()
    .then(() => {
    app_1.app.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
