type clientMessage = {
    author: "User" | "ChatGPT",
    type: "text" | "image"
    message?: string;
    image?: string;
}