import { DatabaseAccess } from "../database/databaseAccess";
import { CreateTodoRequest } from "../requests/CreateTodoRequest";
import { TodoItem } from "../models/TodoItem";
import { Key } from '../models/Key';
import { TodoUpdate } from "../models/TodoUpdate";
import { FileStorageAccessLogic } from "./FileStorageAccessLogic";
const uuid = require('uuid');

export class DatabaseAccessLogic {
    constructor(private databaseAccess = new DatabaseAccess(),
    private fileStorageAccessLogic = new FileStorageAccessLogic()) {}

    public async getTodoItems(userId: string) {
        return await this.databaseAccess.getTodos(userId);
    }

    public async createTodoItem(userId: string, todoRequest: CreateTodoRequest) : Promise<TodoItem> {
        const todoId = uuid.v4();
        let todoItemToAdd: TodoItem = {
            ...todoRequest,
            createdAt: (new Date()).toISOString(),
            done: false,
            todoId,
            userId
        };
        return await this.databaseAccess.createTodoItem(todoItemToAdd);
    }

    public async updateTodoItem(userId: string, todoId: string, item: TodoUpdate) {
        let key: Key = {
            userId,
            todoId
        }
        await this.databaseAccess.updateTodoItem(key, item);
    }

    public async deleteTodoItem(userId: string, todoId: string) {
        let key: Key = {
            userId,
            todoId
        }
        await this.databaseAccess.deleteTodoItem(key);
    }

    public async updateTodoItemAttachmentUrl(userId: string, todoId: string) {
        let key: Key = {
            userId,
            todoId
        };
        await this.databaseAccess.updateTodoItemWithAttachmentUrl(key, this.fileStorageAccessLogic.getObjectUrl(todoId));
    }
}