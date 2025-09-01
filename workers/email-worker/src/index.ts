import nodemailer from "nodemailer";
import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const STREAM_KEY = "trades_stream";
const TRIM_MAX_LEN = 1000;

type RedisStreamMsg = {
  id: string;
  message: Record<string, string>;
};

type RedisStreamReply = {
  name: string;
  messages: RedisStreamMsg[];
};

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

const emailSender = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

let running = true;

async function sendEmail(recipient: string, subject: string, body: string) {
  try {
    await emailSender.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      html: body,
    });
    console.log(`email sent to ${recipient}`);
  } catch (error) {
    console.error("email send failed:", error);
  }
}

async function startEmailWorker() {
  await redisClient.connect();
  console.log("email worker started");

  let lastId = "$"; 

  while (running) {
    try {
      const raw = await redisClient.xRead(
        [{ key: STREAM_KEY, id: lastId }],
        { BLOCK: 5000, COUNT: 50 }
      );

      if (!raw) continue;

      const streams = raw as RedisStreamReply[];

      for (const stream of streams) {
        for (const entry of stream.messages) {
          const { recipient, subject, body } = entry.message;

          if (recipient && subject && body) {
            try {
                await sendEmail(recipient, subject, body)
                console.log(`sending email to ${recipient}`)
            } catch (error) {
                console.log(error)
            }
          }

          lastId = entry.id;
        }
      }

      await redisClient.xTrim(STREAM_KEY, "MAXLEN", TRIM_MAX_LEN);
    } catch (error) {
      console.error("Worker error:", error);
      await sleep(2000);
    }
  }
}

function sleep(ms: number) {
    return new Promise((resolve) => {setTimeout(resolve, ms)})
}

startEmailWorker().catch(console.error);
