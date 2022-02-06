import DataLoader from "dataloader";
import User from "../entities/User";

// keys = [1, 78, 6, 8]  // user ids
// returns [User, User, User, User] // users
export const createUserLoader = () =>
    new DataLoader<number, User>(async (userIds) => {
        const users = await User.findByIds(userIds as number[]);
        const userIdToUser: Record<number, User> = {};
        users.forEach((u) => {
            userIdToUser[u.id] = u;
        });

        return userIds.map((userId) => userIdToUser[userId]);
    });
