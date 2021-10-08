import App from "./App.model";
import { IAppDocument } from "./App.types";

export async function findByUrl(
  this: typeof App,
  url: string
): Promise<IAppDocument | null> {
  const parsedUrl = new URL(url);
  return this.findOne({ host: parsedUrl.host });
}
