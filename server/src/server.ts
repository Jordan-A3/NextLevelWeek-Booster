import express from 'express'

const app = express()

app.get('/users', (request, response)=>{
    console.log("Listagem de usuarios")

    response.json([
        "Ananda",
        "Diego",
        "Maik"
    ])
})

//

app.listen(3333)