const express = require('express')
const path = require('path')

const dbPath = path.join(__dirname, 'moviesData.db')

const app = express()

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

app.use(express.json())

let db = null

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running...')
    })
  } catch (e) {
    console.log(`Db Error : '${e.message}'`)
    process.exit(1)
  }
}

intializeDbAndServer()

// GET Movies API

app.get('/movies/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      movieName: dbObject.movie_name,
    }
  }

  const movieQuery = `SELECT movie_name FROM movie`
  const moviesArray = await db.all(movieQuery)

  response.send(
    moviesArray.map(eachMovie => convertDbObjectToResponseObject(eachMovie)),
  )
})

//  POST Movies API

app.post('/movies/', (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const addBookQuery = `INSERT INTO movie(director_id,movie_name,lead_actor) VALUES(${directorId},'${movieName}','${leadActor}')`
  await db.run(addBookQuery)
  response.send('Movie Successfully Added')
})

// GET Movie API

app.get('/movies/:movieId/', async (request, response) => {
  const convertDbObjectToResponseobject = dbObject => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
      leadActor: dbObject.lead_actor,
    }
  }
  const {movieId} = request.params
  const movieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId}`
  const movieArray = await db.get(movieQuery)
  response.send(convertDbObjectToResponseobject(movieArray))
})

// PUT Movie API

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const movieQuery = `UPDATE movie SET director_id = ${directorId},movie_name = '${movieName}',lead_actor = '${leadActor}' WHERE movie_id = ${movieId}`
  await db.run(movieQuery)
  response.send('Movie Details Updated')
})

// DELETE movie API

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// GET Directors API

app.get('/directors/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      directorId: dbObject.director_id,
      directorName: dbObject.director_name,
    }
  }
  const directorQuery = `SELECT * FROM director;`
  const directorArray = await db.all(directorQuery)
  const directorArrayResponse = directorArray.map(eachDirector =>
    convertDbObjectToResponseObject(eachDirector),
  )
  response.send(directorArrayResponse)
})

// GET Director Movies API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const convertDbObjectToResponseObject = dbObject => {
    return {
      movieName: dbObject.movie_name,
    }
  }
  const {directorId} = request.params
  const directorMoviesQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId}`
  const directorMoviesArray = await db.all(directorMoviesQuery)
  response.send(
    directorMoviesArray.map(eachDirector =>
      convertDbObjectToResponseObject(eachDirector),
    ),
  )
})

module.exports = app
