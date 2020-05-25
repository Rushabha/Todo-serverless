import * as AWS from 'aws-sdk';
import { TodoItem } from '../models/TodoItem';
import { Key } from '../models/Key';
import { TodoUpdate } from '../models/TodoUpdate';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

export class DatabaseAccess {
    constructor(private readonly todosTable = process.env.TODO_TABLE,
        private readonly documentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosIndex = process.env.TODO_INDEX) { }

    public async getTodos(userId: string) {
        let result = await this.documentClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ScanIndexForward: false,
            ProjectionExpression: '#todoId, #name, #createdAt, #dueDate, #done, #attachmentUrl',
            ExpressionAttributeNames: {
                '#todoId': 'todoId',
                '#name': 'name',
                '#createdAt': 'createdAt',
                '#dueDate': 'dueDate',
                '#done': 'done',
                '#attachmentUrl': 'attachmentUrl'
            }
        }).promise();
        return result.Items;
    }

    public async createTodoItem(item: TodoItem) {
        await this.documentClient.put({
            TableName: this.todosTable,
            Item: item
        }).promise();
        return item;
    }

    public async deleteTodoItem(key: Key) {
        await this.documentClient.delete({
            TableName: this.todosTable,
            Key: key
        }).promise();
    }

    public async updateTodoItem(key: Key, item: TodoUpdate) {
        await this.documentClient.update({
            TableName: this.todosTable,
            Key: key,
            UpdateExpression: 'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            },
            ExpressionAttributeValues: {
                ':name': item.name,
                ':dueDate': item.dueDate,
                ':done': item.done,
            }
        }).promise();
    }

    public async updateTodoItemWithAttachmentUrl(key, url) {
        await this.documentClient.update({
          TableName: this.todosTable,
          Key: key,
          UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
          ExpressionAttributeNames: { 
            '#attachmentUrl': 'attachmentUrl'
          },
          ExpressionAttributeValues: {
            ':attachmentUrl': url
          }
        }).promise();
      }
}