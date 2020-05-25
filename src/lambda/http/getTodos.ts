import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { getUserId } from '../utils';
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { DatabaseAccessLogic } from '../../businessLogic/DatabaseAccessLogic';
import { createLogger } from '../../utils/logger'

const databaseAccessLogic = new DatabaseAccessLogic();
const logger = createLogger('getTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = getUserId(event);
  logger.info('Getting todo items');
  let todoItems = await databaseAccessLogic.getTodoItems(userId);
  logger.info('Got todo items', todoItems);
  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todoItems
    })
  }
});

handler.use(cors({
  credentials: true
}));
