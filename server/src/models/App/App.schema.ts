import { Schema } from "mongoose";
import { findByUrl } from "./App.statics";
import { IApp, IAppModel, IAppDocument } from "./App.types";

const AppSchemaFields: Record<keyof IApp, any> = {
  name: { type: String, required: true, unique: true, index: true },
  url: { type: String, required: true, unique: true },
  host: { type: String, index: true },
  accessKey: { type: String, required: true },
};

const AppSchema = new Schema<IAppDocument, IAppModel>(AppSchemaFields);

AppSchema.statics.findByUrl = findByUrl;

export default AppSchema;
