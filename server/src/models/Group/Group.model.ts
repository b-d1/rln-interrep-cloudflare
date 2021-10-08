import { model } from "mongoose";
import GroupSchema from "./Group.schema";
import { IGroupDocument, IGroupModel } from "./Group.types";

const MODEL_NAME = "Group";

const Group: IGroupModel = model<IGroupDocument, IGroupModel>(
  MODEL_NAME,
  GroupSchema,
  "groups"
);

export default Group;
