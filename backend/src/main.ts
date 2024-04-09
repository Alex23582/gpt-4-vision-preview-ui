import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import OpenAI from 'openai';
import { ChatCompletionContentPart } from 'openai/resources';
const app = express()
app.use(express.json({
    limit: "30mb"
}))
app.use(cors({
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))
const port = 3001

app.use(express.static("/frontend/build"))

app.post('/getResponse', async (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    const body: {maxLength: string, apikey: string, messages: clientMessage[]} = req.body
    const response = await new OpenAI({apiKey: req.body.apikey}).chat.completions.create(({
        model: "gpt-4-vision-preview",
        max_tokens: req.body.maxLength,
        messages: body.messages.map((message) => {
            let content: ChatCompletionContentPart[] = []
            if (message.message) {
                content.push({
                    type: "text",
                    text: message.message,
                })
            }
            if (message.image) {
                content.push({
                    type: "image_url",
                    image_url: {
                        url: message.image
                    }
                })
            }
            let role = "assistant"
            if(message.author == "User"){
                role = "user"
            }
            return {
                role,
                content: content,
            } as any
        }),
        stream: true
    }))
    for await (const part of response) { 
        const chunk = part.choices[0]?.delta?.content
        if (chunk)
            res.write(chunk);
    }
    res.end()
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})