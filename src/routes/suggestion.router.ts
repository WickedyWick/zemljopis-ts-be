import { generalSuggestion } from 'controllers/pageControllers/suggestion.controller'
import { Router } from 'express'
import { dir } from 'index'
import { generalSuggestionValidator } from 'validators/suggestionValidator'
const router = Router()

router.get('/', (req,res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8')
    res.sendFile('./public/views/suggestion.html', { root: dir })
})

router.post('/suggest-general', generalSuggestionValidator, generalSuggestion)

export const suggestionRouter = router