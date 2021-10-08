import { model } from "mongoose";
import AppSchema from "./App.schema";
import { IAppDocument, IAppModel } from "./App.types";

const MODEL_NAME = "App";

const App: IAppModel = model<IAppDocument, IAppModel>(
  MODEL_NAME,
  AppSchema,
  "apps"
);

export default App;
