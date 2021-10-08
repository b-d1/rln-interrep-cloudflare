import { Schema } from "mongoose";
import { IGroup, IGroupDocument, IGroupModel } from "./Group.types";

const GroupSchemaField: Record<keyof IGroup, any> = {
  groupId: { type: String, required: true, unique: true },
};

const GroupSchema = new Schema<IGroupDocument, IGroupModel>(GroupSchemaField);

export default GroupSchema;
