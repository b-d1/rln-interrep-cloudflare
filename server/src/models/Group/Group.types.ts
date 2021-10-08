import { Model, Document } from "mongoose";

export interface IGroup {
  groupId: string;
}

export interface IGroupDocument extends IGroup, Document {}

export interface IGroupModel extends Model<IGroupDocument> {}
