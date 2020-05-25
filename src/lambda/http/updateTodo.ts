import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils';
import { DatabaseAccessLogic } from '../../businessLogic/DatabaseAccessLogic'
import { createLogger } from '../../utils/logger'

const databaseAccessLogic = new DatabaseAccessLogic();
const logger = createLogger('updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  logger.info(`Updating todo item ${todoId}`, updatedTodo);
  await databaseAccessLogic.updateTodoItem(userId, todoId, updatedTodo);
  return {
    statusCode: 204,
    body: undefined
  }
});

handler.use(cors({
  credentials: true
}));