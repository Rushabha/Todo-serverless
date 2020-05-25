import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getUserId } from '../utils';
import { FileStorageAccessLogic } from '../../businessLogic/FileStorageAccessLogic';
import { DatabaseAccessLogic } from '../../businessLogic/DatabaseAccessLogic';
import { createLogger } from '../../utils/logger'

const fileStorageAccessLogic = new FileStorageAccessLogic();
const databaseAccessLogic = new DatabaseAccessLogic();
const logger = createLogger('getUploadUrl')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  const todoId = event.pathParameters.todoId
  logger.info('Getting upload url for todo item', todoId);
  const uploadUrl = fileStorageAccessLogic.getUploadUrl(todoId);
  await databaseAccessLogic.updateTodoItemAttachmentUrl(userId, todoId);
  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl
    })
  }
});


handler.use(cors({
  credentials: true
}));