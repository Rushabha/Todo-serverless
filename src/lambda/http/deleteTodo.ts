import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { DatabaseAccessLogic } from '../../businessLogic/DatabaseAccessLogic';
import { FileStorageAccessLogic } from '../../businessLogic/FileStorageAccessLogic';
import { createLogger } from '../../utils/logger'

const databaseAccessLogic = new DatabaseAccessLogic();
const fileStorageAccessLogic = new FileStorageAccessLogic();
const logger = createLogger('deleteTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;
  const userId = getUserId(event);
  logger.info('Deleting todo item', todoId);
  await databaseAccessLogic.deleteTodoItem(userId, todoId);
  await fileStorageAccessLogic.deleteImage(todoId);
  return {
    statusCode: 204,
    body: undefined
  }
});

handler.use(cors({
  credentials: true
}));