import { app } from "./app";
import { initDb } from "./db/pool";

const port = process.env.PORT ? Number(process.env.PORT) : 4000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });


