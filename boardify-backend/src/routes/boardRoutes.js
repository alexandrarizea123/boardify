import express from 'express'
import {
    getBoards,
    getBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    getTaskTypes,
    createTaskType,
} from '../controllers/boardController.js'

const router = express.Router()

router.get('/boards', getBoards)
router.post('/boards', createBoard)
router.get('/boards/:id', getBoard)
router.put('/boards/:id', updateBoard)
router.delete('/boards/:id', deleteBoard)

router.get('/task-types', getTaskTypes)
router.post('/task-types', createTaskType)

export default router
