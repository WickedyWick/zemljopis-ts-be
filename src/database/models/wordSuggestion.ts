import { Model , BaseModel, ModelDate } from 'database/model'

export interface WordSuggestionFields {
    id: number
    category_id: number
    word: string
    created_at: ModelDate
    updated_at: ModelDate
}

export interface WordSuggestionMethods {
}

export type WordSuggestionModel = Model<WordSuggestionFields, WordSuggestionMethods>

export class WordSuggestion extends BaseModel<WordSuggestionFields, WordSuggestionMethods> {
    fields: [
        'id',
        'category_id',
        'word',
        'created_at',
        'updated_at'
    ]

    constructor() {
        super('word_suggestions')
    }

    instanceMethods: WordSuggestionMethods = {

    }
}

export default new WordSuggestion()