import fs from 'fs' //to read from and write from files
import path from 'path' //This will show us the path that works on any operating system, so will work if impoted on another system
import dotenv from 'dotenv' // Allows the computer to read the console's environment file

dotenv.config()

const DATA_DIR = path.join(import.meta.dirname, 'data') //we are creating a folder called data, this will make sure that the files are always aved in the right place.
if (!fs.existsSync(DATA_DIR)) { //We are seeing if the folder DATA_DIR exists or not
    fs.mkdirSync(DATA_DIR) //If it doesn't exist, then it will create a folder which will be called 'data' by calling line 5
}

const WEATHER_FILE = path.join(DATA_DIR, 'weather.json') //So inside the data dir, it will create a file
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv')//This is creating a weather csv inside the data folder

export async function fetchWeather(){
    const apiKey = process.env.WEATHER_API_KEY
    const city = process.env.CITY || 'London' //if city is not avalable, just default to London
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        const nowUTC = new Date().toISOString() //This is to create our graphic, we need dates and timings. This wil create a time stamp of the data.
        data._last_updated_utc = nowUTC //This adds a new property to the data we have fetched will be the time it was created
        fs.writeFileSync(WEATHER_FILE, JSON.stringify(data, null, 2)) //So this, will convert value to json, then convert to a javaScipt object (so we can add a line 26), then it converts it back to Json so it can be read
    
        const header = 'timestamp,city,temperature,description\n' //these are the headers used in the graph, with \n adding a newline, for the log file
        if(!fs.existsSync(LOG_FILE)) {
            fs.writeFileSync(LOG_FILE, header) //This will see if the Log exists and if not it will create it
        } else {
            const firstLine = fs.readFileSync(LOG_FILE, 'utf8').split('\n')[0] // if the log file does exist, it will read the entire csv using utf8, and split the file into the lines, and take the first line
            if (firstLine !== 'timestamp,city,temperature,description') { //if the first line, doesn't have the correct headers, it will add in the headers, and then re-read the file
                fs.writeFileSync(LOG_FILE, header + fs.readFileSync(LOG_FILE, 'utf8'))
            }
        }

        const logEntry = `${nowUTC},${city},${data.main.temp},${data.weather[0].description}\n`
        fs.appendFileSync(LOG_FILE, logEntry) //This now logs the elements from the fetch which we actually want, in the order of the headers.

        console.log(`Weather data updated for ${city} at ${nowUTC}`);
    } catch (error) {
        console.log('Error fetching weather:', error);
    }
}

    if(import.meta.url === `file://${process.argv[1]}`) { //Import the current files url, if it matches with the url running in the browser, then run fetch weather
        fetchWeather() //This small if statement, keeps the script running safely, as it checks the node and browser are doing the same thing.
}

fetchWeather()
