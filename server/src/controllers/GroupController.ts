import Group from "../models/group/Group.model";


class GroupController {

    public groupExists = async (groupId: string): Promise<boolean> => {
        const group = await Group.findOne({ groupId });
        return group ? true : false;
      };

    public addGroup = async (groupId: string) => {
        const group = new Group({ groupId });
        await group.save();
    }
}

export default GroupController