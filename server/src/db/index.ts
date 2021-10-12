import { connect } from "mongoose";

const initDb = async () => {
  await connect(process.env.DB_CONNECTION_STRING as string);
};

export { initDb };
