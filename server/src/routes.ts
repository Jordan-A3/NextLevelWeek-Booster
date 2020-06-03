import express, { response } from 'express'

import PointsController from'./controllers/pointsController'
import ItemsController from './controllers/itemsController'

const routes = express.Router()

const pointsController = new PointsController
const itemsController = new ItemsController

// index: Listagem
// show: exibir unico registro
// create, update, delete
routes.get('/items', itemsController.index)

routes.post('/points', pointsController.create)
routes.get('/points/:id', pointsController.show)
routes.get('/points/', pointsController.index)



export default routes