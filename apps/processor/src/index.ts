
import { prismaClient } from 'db';
import { Kafka } from 'kafkajs';

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
    clientId : "outbox-processor",
    brokers: process.env.KAFKA_BROKERS?.split(",") ?? ["localhost:9092"],
})

const client =  prismaClient;



async function  main() {

    const producer = kafka.producer()
    await producer.connect()

    while(1){
        const pendingRows = await client.zapRunOutbox.findMany({
        where:{},
        take : 10
    })
    
    if (pendingRows.length > 0) {
        console.log(`Processing ${pendingRows.length} outbox entries`)
        producer.send({
            topic: TOPIC_NAME,
            messages: pendingRows.map(r => ({
                value : JSON.stringify({
                    zapRunId: r.zapRunId,
                    stage: 0
                })
            }))
        })

        await client.zapRunOutbox.deleteMany({
            where: {
                id: {
                    in: pendingRows.map(r => r.id)
                }
            }
        })
        console.log(`Deleted ${pendingRows.length} outbox entries`)
    }

    await new Promise(resolve => setTimeout(resolve, 3000))
    }
    
    
    
}

main();

