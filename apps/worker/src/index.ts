
import { prismaClient } from 'db';
import { Kafka } from 'kafkajs';

const TOPIC_NAME = "zap-events";

const kafka = new Kafka({
    clientId : "outbox-processor",
    brokers: ["localhost:9092"],
})

const client =  prismaClient;

async function  main() {   
    const consumer = kafka.consumer({groupId: TOPIC_NAME });
    await consumer.connect();

    await consumer.subscribe({topic: TOPIC_NAME, fromBeginning: true}); 

    await consumer.run({
        autoCommit : false,
        eachMessage: async({topic,partition,message}) => {
            console.log({
                partition,
                offset:message.offset,
                value : message.value?.toString(),
                timestamp:message.timestamp
            })

            await new Promise(r => setTimeout(r,10000))

            await consumer.commitOffsets([
                {
                    topic,
                    partition,
                    offset : (Number(message.offset) + 1).toString()
                }
            ])
            
        }


    })
    
    

    
}

main();
