import type { FastifyReply, FastifyRequest } from 'fastify';
import type { User, UserResponse } from '@{{PROJECT_NAME}}/shared/entities/user';

const handler = async (req: FastifyRequest, res: FastifyReply) => {
  const users = (await req.server.mongo.db?.collection('users').find({}).toArray()) as User[];

  // Transform to remove password for API response
  const userResponses: UserResponse[] = users.map((user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    ...(user.createdAt && { createdAt: user.createdAt }),
    ...(user.updatedAt && { updatedAt: user.updatedAt }),
  }));

  return res.success(userResponses);
};

export default handler;
