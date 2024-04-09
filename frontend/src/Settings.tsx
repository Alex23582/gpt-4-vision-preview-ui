import styles from './Settings.module.css'

const Settings = ({ apikey, setapikey, maxLength, setmaxlength }: {
    apikey: string,
    setapikey: React.Dispatch<React.SetStateAction<string>>,
    maxLength: string,
    setmaxlength: React.Dispatch<React.SetStateAction<string>>
}) => {
    return (
        <div className={styles.main}>
            <div className={styles.optionsitem}>
                <p>OpenAI API-Key</p>
                <input value={apikey} onChange={(e) => { setapikey(e.target.value) }} />
            </div>
            <div className={styles.optionsitem}>
                <p>Max length (0-4096 Tokens)</p>
                <input value={maxLength} onChange={(e) => { setmaxlength(e.target.value) }} />
            </div>
        </div>
    )
}

export default Settings