import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';

const XAWS = AWSXRay.captureAWS(AWS);

export class FileStorageAccess {
    constructor(private readonly imageBucket = process.env.IMAGE_BUCKET,
        private readonly signedUrlExpiration = process.env.SIGNED_EXPIRATION,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' })) { }

    public getUploadUrl(id) {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.imageBucket,
            Key: id,
            Expires: this.signedUrlExpiration
        });
    }

    public async deleteObject(id) {
        return await this.s3.deleteObject({
            Bucket: this.imageBucket,
            Key: id
        }).promise();
    }

    public getObjectUrl(id) {
        return `https://${this.imageBucket}.s3.amazonaws.com/${id}`
    }
}