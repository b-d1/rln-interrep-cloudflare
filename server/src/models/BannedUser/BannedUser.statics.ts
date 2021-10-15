import
    BannedUser
   from "./BannedUser.model";



export async function getTotalBannedUsers(
    this: typeof BannedUser,
  ): Promise<number> {
    return this.countDocuments({});
  }
