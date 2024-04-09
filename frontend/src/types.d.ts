/*type message = {
    author: "User" | "ChatGPT",
    type: "text" | "image"
    message?: string;
    image?: string;
}*/

type message = {
    author: "User" | "ChatGPT",
    message: string,
    image?: string,
    selectedChildMessage: number,
    childMessages: message[]
}