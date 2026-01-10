import express from 'express'
import {
    getCollabBoards,
    createCollabBoard,
    getCollabBoard,
    updateCollabBoard,
    deleteCollabBoard,
    inviteToCollabBoard,
    acceptCollabInvite,
    getCollabBoardMembers,
} from '../controllers/collabController.js'

const router = express.Router()

router.get('/collab-boards', getCollabBoards)
router.post('/collab-boards', createCollabBoard)
router.get('/collab-boards/:id', getCollabBoard)
router.put('/collab-boards/:id', updateCollabBoard)
router.delete('/collab-boards/:id', deleteCollabBoard)
router.post('/collab-boards/:id/invite', inviteToCollabBoard)
router.get('/collab-boards/:id/members', getCollabBoardMembers)

router.post('/collab-invites/accept', acceptCollabInvite)

export default router
