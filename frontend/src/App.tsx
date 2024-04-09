import { ChangeEvent, useEffect, useRef, useState } from 'react';
import styles from './App.module.css';
import Settings from './Settings';

function App() {
  const [messages, setmessages] = useState<message[]>([])
  const [messageInEdit, setmessageInEdit] = useState(-1)
  const [editInput, seteditInput] = useState("")
  const firstmessages = useRef<message[]>([])
  const selectedfirstmessage = useRef<number>(0)
  const fileInput = useRef<HTMLInputElement>(null)
  const [fileSelected, setFileSelected] = useState(false)
  const [textInput, settextInput] = useState("")
  const [settingsOpen, setsettingsOpen] = useState(false)
  const [apikey, setapikey] = useState("")
  const [maxLength, setmaxLength] = useState("1000")

  function selectFile() {
    fileInput.current?.click()
  }

  function fileSelectedEvent(e: ChangeEvent<HTMLInputElement>) {
    if (!fileInput.current || !fileInput.current.files) {
      return
    }
    if (fileInput.current.files.length > 0) {
      setFileSelected(true)
    }
  }

  function getImageBase64() {
    return new Promise<string | void>((resolve, reject) => {
      if (!fileInput.current || !fileInput.current.files || fileInput.current.files.length === 0) {
        resolve()
        return
      }
      var reader = new FileReader();
      reader.readAsDataURL(fileInput.current.files[0]);
      reader.onload = function () {
        resolve(reader.result?.toString())
      };
      reader.onerror = function (error) {
        reject(error)
      };
    })
  }

  function clearInputs() {
    if (fileInput.current && fileInput.current.files) {
      fileInput.current.value = ""
      setFileSelected(false)
    }
    settextInput("")
  }

  async function sendMessage(message: string, append = true) {
    const baseImage = await getImageBase64()
    const userMessage: message = {
      author: 'User',
      message: message,
      image: baseImage ? baseImage : "",
      childMessages: [],
      selectedChildMessage: 0
    }
    const requestMessages: message[] = [
      ...messages.map((msg) => {
        return {
          ...msg,
          childMessages: []
        }
      }),
      userMessage
    ]
    clearInputs()
    if (append) {
      appendMessage(userMessage)
    }
    const response = await fetch(process.env.REACT_APP_BACKEND_URL + "/getResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        apikey: apikey,
        maxLength,
        messages: requestMessages
      })
    })
    if (!response.body) {
      return
    }
    const newMessage: message = {
      author: "ChatGPT",
      childMessages: [],
      selectedChildMessage: 0,
      message: ""
    }
    appendMessage(newMessage)
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      newMessage.message += value
      updateMessages()
    }
  }

  function getMessages() {
    let finished = false
    if (firstmessages.current.length === 0) {
      return []
    }
    let lastMessage: message = firstmessages.current[selectedfirstmessage.current];
    let messages: message[] = [lastMessage]
    while (!finished) {
      if (lastMessage.childMessages.length === 0) {
        finished = true
        continue
      }
      const newMessage = lastMessage.childMessages[lastMessage.selectedChildMessage]
      messages.push(newMessage)
      lastMessage = newMessage
    }
    return messages
  }

  function appendMessage(message: message) {
    if (firstmessages.current.length === 0) {
      firstmessages.current.push(message)
    } else {
      let currentMessage: message = getMessages()[getMessages().length - 1]
      currentMessage.childMessages.push(message)
      currentMessage.selectedChildMessage = currentMessage.childMessages.length - 1
    }
    updateMessages()
  }

  useEffect(() => {
    updateMessages()
  }, [])

  function updateMessages() {
    setmessages(getMessages())
  }

  function changeMessageVariant(index: number, change: number) {
    if (index == 0) {
      const newValue = selectedfirstmessage.current + change
      if (newValue < 0 || firstmessages.current.length - 1 < newValue) {
        return
      }
      selectedfirstmessage.current += change
    } else {
      const message = getMessages()[index - 1]
      const newValue = message.selectedChildMessage + change
      if (newValue < 0 || message.childMessages.length - 1 < newValue) {
        return
      }
      message.selectedChildMessage = newValue
    }
    updateMessages()
  }

  function editMessage(index: number) {
    saveMessage()
    seteditInput(getMessages()[index].message);
    setmessageInEdit(index)
  }

  function saveMessage() {
    if (messageInEdit === -1) {
      return
    }
    const message = getMessages()[messageInEdit]
    const newMessage = {
      author: message.author,
      message: editInput,
      image: message.image,
      selectedChildMessage: 0,
      childMessages: []
    }

    if (messageInEdit == 0) {
      firstmessages.current.push(newMessage)
      selectedfirstmessage.current = firstmessages.current.length - 1
    } else {
      const parentMessage = getMessages()[messageInEdit - 1]
      parentMessage.childMessages.push(newMessage)
      parentMessage.selectedChildMessage = parentMessage.childMessages.length - 1
    }
    setmessageInEdit(-1);
    updateMessages()
    if (message.author === "User") {
      sendMessage(editInput, false)
    }
  }

  

  return (
    <div className={styles.main}>
      <div className={styles.top}>
        <h1>GPT-4 Image Preview</h1>
        <button onClick={() => { setsettingsOpen(!settingsOpen) }} className={styles.button}>Settings</button>
      </div>
      {settingsOpen && <Settings maxLength={maxLength} setmaxlength={setmaxLength} apikey={apikey} setapikey={setapikey} />}
      {!settingsOpen && <>
        <div className={styles.messagesContainer}>
          {messages.map((message, i) => {
            let currentVariant = selectedfirstmessage.current + 1
            let totalVariants = firstmessages.current.length
            if (i > 0) {
              let previousMessage = messages[i - 1]
              currentVariant = previousMessage.selectedChildMessage + 1
              totalVariants = previousMessage.childMessages.length
            }
            let edit = messageInEdit === i
            return <div key={i} className={styles.message}>
              <p className={styles.authorText}>{message.author}</p>
              <div className={styles.textMessage}>
                {!edit && <>{message.message}</>}
                {edit && <textarea value={editInput} onChange={(e) => { seteditInput(e.target.value) }} />}
                {message.image && <img src={message.image} />}
                <div className={styles.messageOptionsContainer}>
                  {!edit && <button onClick={() => { editMessage(i) }} className={styles.button}>EDIT</button>}
                  {edit && <button onClick={() => { saveMessage() }} className={styles.button}>SAVE</button>}
                  {totalVariants > 1 && <div className={styles.messageSelectorContainer}>
                    <button onClick={() => { changeMessageVariant(i, -1) }}>&#10140;</button>
                    <p>{currentVariant}/{totalVariants}</p>
                    <button onClick={() => { changeMessageVariant(i, 1) }}>&#10140;</button>
                  </div>}
                </div>
              </div>
            </div>
          })}
        </div>
        <div className={styles.inputContainer}>
          <input onKeyDown={(e) => {
            if (e.key == "Enter") {
              sendMessage(textInput)
            }
          }} value={textInput} onChange={(e) => { settextInput(e.target.value) }} />
          <input onChange={fileSelectedEvent} accept='image/*' ref={fileInput} type="file" style={{ display: "none" }} />
          <button onClick={selectFile}>{fileSelected ? "✔" : "Image"}</button>
          <button onClick={() => { sendMessage(textInput) }}>Send</button>
        </div>
      </>}
    </div>
  );
}

export default App;
