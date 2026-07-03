
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://minio:9000",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadminpassword",
    },
    forcePathStyle: true,
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "progressive-uploads"

const policy = {
    Version: "2012-10-17",
    Statement: [
        {
            Effect: "Allow",
            Principal: { AWS: ["*"] },
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
    ],
}

async function main() {
    try {
        console.log(`Checking bucket: ${BUCKET_NAME}...`)

        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }))
            console.log("Bucket exists.")
        } catch (error: unknown) {
            const err = error as { name?: string, $metadata?: { httpStatusCode?: number } }
            if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
                console.log("Bucket not found. Creating...")
                await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }))
                console.log("Bucket created.")
            } else {
                throw error
            }
        }

        console.log("Setting public read policy...")
        await s3Client.send(
            new PutBucketPolicyCommand({
                Bucket: BUCKET_NAME,
                Policy: JSON.stringify(policy),
            })
        )
        console.log("Policy set successfully to PUBLIC READ.")

        console.log("Setting CORS policy...")
        try {
            await s3Client.send(
                new PutBucketCorsCommand({
                    Bucket: BUCKET_NAME,
                    CORSConfiguration: {
                        CORSRules: [
                            {
                                AllowedHeaders: ["*"],
                                AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                                AllowedOrigins: ["*"],
                                ExposeHeaders: ["ETag"],
                                MaxAgeSeconds: 3000,
                            },
                        ],
                    },
                })
            )
            console.log("CORS policy set successfully.")
        } catch (corsError) {
            const errorWithMetadata = corsError as {
                name?: string
                Code?: string
                message?: string
                $metadata?: { httpStatusCode?: number }
            }
            const message = errorWithMetadata.message || errorWithMetadata.name || String(corsError)
            const statusCode = errorWithMetadata.$metadata?.httpStatusCode
            const isExpectedMinioUnsupported = /NotImplemented|MethodNotAllowed|NotSupported/i.test(message) || statusCode === 501 || errorWithMetadata.Code === "NotImplemented"
            if (isExpectedMinioUnsupported) {
                console.warn("⚠️ MinIO does not support bucket CORS API in this deployment; relying on server-level CORS settings.")
            } else {
                console.warn("⚠️ Warning: Failed to set bucket CORS policy:", corsError)
            }
        }

    } catch (error) {
        console.error("Failed to initialize storage:", error)
        process.exit(1)
    }
}

main()
