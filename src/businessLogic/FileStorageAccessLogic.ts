import { FileStorageAccess } from "../fileStorage/FileStorageAccess";

export class FileStorageAccessLogic {
    constructor(private fileStorageAccess = new FileStorageAccess()) {}

    public getUploadUrl(id: string) {
        return this.fileStorageAccess.getUploadUrl(id);
    }

    public async deleteImage(id: string) {
        await this.fileStorageAccess.deleteObject(id);
    }

    public getObjectUrl(id: string) {
        return this.fileStorageAccess.getObjectUrl(id);
    }
}