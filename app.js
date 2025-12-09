import express from 'express'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'
import dotenv from 'dotenv'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 5000
//the below lines create the files, the ones within fetch weather update the files (by revreating them essentially)
const DATA_DIR = path.join(import.meta.dirname, 'data') //path to data folder
const WEATHER_FILE = path.join(DATA_DIR, 'weather.json') //path to the data_dir, json file
const LOG_FILE = path.join(DATA_DIR, 'weather_log.csv') //path to the data_dir, csv file

app.use(express.static(path.join(import.meta.dirname, 'public'))) //This tells express to automatically allow user to access the files within the public folder

app.get('/api/weather', (req, res) => {
    if (!fs.existsSync(WEATHER_FILE)) {
        return res.status(404).json({error: 'No weather data available'})
    }

    try {
        const weatherData = JSON.parse(fs.readFileSync(WEATHER_FILE, 'utf8')) //We will first read the weather file, and then will turn weather file into an object from a string 
        res.json(weatherData)
    } catch (error) {
        console.log('Error reading weather.json:', error);
        res.status(500).json({ error: 'Failed to read weather data'})
    }
})

app.get('/api/weather-log', (req, res) => {
    if (!fs.existsSync(LOG_FILE)) {
         return res.status(404).json({ error: 'No weather log available'})
    }

    const timestamps = []
    const temps = []

// Check if our Log File has all of the information we need
  fs.createReadStream(LOG_FILE)
    .pipe(csv()) // Open csv file so it can be read line-by-line, use csv-parser to turn each line into object
    .on('data', (row) => {
      // Check timestamp and temperature exists
      if (row.timestamp && row.temperature) {
        timestamps.push(row.timestamp); // Add timestamp to array
        temps.push(parseFloat(row.temperature)); // Add temps as float values to array
      }
    })
    .on('end', () => res.json({ timestamps, temps })) // At the end of the file, return the arrays in an object
    .on('error', (err) => {
      console.log('Error reading CSV: ', err);
      res.status(500).json({ error: 'Failed to read log' });
    });
});
app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`); // Listens for connections on PORT
});