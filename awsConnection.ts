import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";

const s3 = new S3Client({ region: "eu-north-1", credentials: fromEnv()});

export async function S3sendFile(idFile:string, file:File) {

    const command = new PutObjectCommand({
         "Key" : idFile, 
         "Bucket" : "fotosalone",
         "Body" : file.name,
    })
    await s3.send(command);
}

