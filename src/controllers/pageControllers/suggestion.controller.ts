import { logError } from 'utils/logger'
import { Action } from 'utils/typings'
import { ERROR_GENERAL_SUGGESTION } from 'utils/errors/suggestion'
import { GeneralSuggestion } from 'database/models'
interface generalSuggestionBody {
    suggestion: string
}
export const generalSuggestion: Action<any, generalSuggestionBody, any , any> = async (req, res, next) => {
    try {
        const { suggestion } = await req.body
        const sugg = await GeneralSuggestion.create({
            'suggestion_text': suggestion
        })
        return res.status(201).send()
    } catch (e) {
        await logError(`Error during adding suggstion`, e)
        return next(ERROR_GENERAL_SUGGESTION)
    }
}