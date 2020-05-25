import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { DatabaseAccessLogic } from '../../businessLogic/DatabaseAccessLogic'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'

const databaseAccessLogic = new DatabaseAccessLogic();
const logger = createLogger('createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body);
  const userId = getUserId(event);
  logger.info('Adding todo item', newTodo);
  let todoItemToAdd: TodoItem = await databaseAccessLogic.createTodoItem(userId, newTodo);
  return {
    statusCode: 201,
    body: JSON.stringify({
      item: todoItemToAdd
    })
  }
});

handler.use(cors({
  credentials: true
}));