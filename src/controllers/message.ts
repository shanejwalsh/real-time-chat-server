import { Response, Request } from 'express';
import db from '../utils/db';

type Message = {
  id: string;
  content: string;
  createdAt: Date;
  author: string;
};

type CreateMessageRequest = {
  content: string;
  author: string;
};

export async function getMessages(_: any, resp: Response<Array<Message>>) {
  const messages = await db.message.findMany();

  resp.json(messages);
}

export async function createMessage(req: Request<CreateMessageRequest>, resp: Response<Message>) {
  const { content, author } = req.body;

  const message = await db.message.create({
    data: {
      content,
      author,
    },
  });

  resp.status(201).json(message);
}

export async function deleteAllMessages(_: any, resp: Response) {
  await db.message.deleteMany();

  return resp.status(204);
}
