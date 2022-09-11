import { INSTANCE_ID } from "./lib/env.mjs";
import { storageBlobClient } from "./lib/storageBlobClient.mjs";
import { setTimeout } from "node:timers/promises"

const containerName = "container-" + INSTANCE_ID;
const fileName = `test-${new Date().toJSON()}.txt`;

await setTimeout(1000)

console.log("\n\nCreate Container");
console.time("createContainer");
await createContainer(containerName);
console.timeEnd("createContainer");

await setTimeout(1000)

console.log("\n\nUpload Container Blob");
console.time("uploadBlob");
await uploadBlob(containerName, fileName, Buffer.from("Hello from blob file!", "utf-8"));
console.timeEnd("uploadBlob");

await setTimeout(1000)

console.log("\n\nList Container Blob");
console.time("listContainerBlobs");
await listContainerBlobs(containerName);
console.timeEnd("listContainerBlobs");

await setTimeout(1000)

console.log("\n\nDownload Container Blob");
console.time("downloadBlob");
await downloadBlob(containerName, fileName);
console.timeEnd("downloadBlob");

await setTimeout(1000)

console.log("\n\nGet Container default metadata");
console.time("getContainerProperties");
await getContainerProperties(containerName);
console.timeEnd("getContainerProperties");

await setTimeout(1000)

console.log("\n\nSet Container metadata");
console.time("setContainerMetadataProperty");
await setContainerMetadataProperty(containerName, "docType", "textDocuments");
await setContainerMetadataProperty(containerName, "category", "guidance");
console.timeEnd("setContainerMetadataProperty");

await setTimeout(1000)

console.log("\n\nGet Container customized metadata");
console.time("getContainerProperties");
await getContainerProperties(containerName);
console.timeEnd("getContainerProperties");

await setTimeout(1000)

console.log("\n\nDelete Container");
console.time("deleteContainer");
await deleteContainer(containerName);
console.timeEnd("deleteContainer");

await setTimeout(1000)

console.log("\n\nFinished!");


async function createContainer(containerName) {

    // Create the container and return a container client object
    let containerClient = await storageBlobClient.createContainer(containerName, { access: "blob" });

    console.log(
        "A container named '" +
        containerName +
        "' has been created. " +
        "\nTake a minute and verify in the portal." +
        "\nNext a file will be created and uploaded to the container."
    );

    return containerClient;
}

/**
 * 
 * @param {string} containerName 
 * @param {string} fileName 
 * @param {Buffer} content 
 */
async function uploadBlob(containerName, fileName, content) {
    // Get a reference to the container
    let containerClient = storageBlobClient.getContainerClient(containerName);

    // Get a reference to the blob
    let blockBlobClient = containerClient.getBlockBlobClient(fileName);

    console.log("Uploading to Blob storage as blob:", blockBlobClient.url);

    // Upload the blob
    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);

    console.log(`Upload block blob ${fileName} successfully`, uploadBlobResponse.requestId);
}

/**
 * @param {string} containerName 
 */
async function listContainerBlobs(containerName) {
    // Get a reference to the container
    let containerClient = storageBlobClient.getContainerClient(containerName);

    let i = 1;
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
        console.log(`Blob ${i++}: ${blob.name} `);
    }
}

/**
 * @param {string} containerName 
 */
async function downloadBlob(containerName, fileName) {
    // Get a reference to the container
    const containerClient = storageBlobClient.getContainerClient(containerName);

    // Get a reference to the blob
    const blobClient = containerClient.getBlockBlobClient(fileName);

    // Get blob content from position 0 to the end
    // In Node.js, get downloaded data by accessing downloadBlockBlobResponse.readableStreamBody
    const downloadBlockBlobResponse = await blobClient.download();

    /**
     * @type {Buffer}
     */
    const downloadBuffer = await new Promise((resolve, reject) => {
        const chunks = [];
        const readableStreamBody = downloadBlockBlobResponse.readableStreamBody
        readableStreamBody.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStreamBody.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStreamBody.on("error", reject);
    });

    console.log(`Downloaded ${fileName} content(${downloadBlockBlobResponse.blobType}) ${downloadBuffer.toString("utf-8")}`);
}

async function getContainerProperties(containerName) {
    // Get a reference to the container
    const containerClient = storageBlobClient.getContainerClient(containerName);

    const properties = await containerClient.getProperties();

    console.log(properties.metadata);
}

async function setContainerMetadataProperty(containerName, metaDataTag, metaDataValue) {
    // Get a reference to the container
    const containerClient = storageBlobClient.getContainerClient(containerName);

    // You need to collect the current metadata
    const { metadata } = await containerClient.getProperties();

    // Set what you need
    metadata[metaDataTag] = metaDataValue;

    // And save with all values
    const properties = await containerClient.setMetadata(metadata);

    console.log(properties);
}

async function deleteContainer(containerName) {
    // Get a reference to the container
    const containerClient = storageBlobClient.getContainerClient(containerName);

    await containerClient.delete()

    console.log(`Deleted Container ${containerName}`)
}

