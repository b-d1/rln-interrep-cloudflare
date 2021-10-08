import { Model, Document } from "mongoose";
import { findByUrl } from "./App.statics";

export interface IApp {
  name: string;
  host: string;
  url: string;
}

export interface IAppDocument extends IApp, Document {}

export interface IAppModel extends Model<IAppDocument> {
  findByUrl: typeof findByUrl;
}
