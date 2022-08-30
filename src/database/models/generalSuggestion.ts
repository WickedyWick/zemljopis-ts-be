import { ModelDate, Model, BaseModel } from "database/model";

export interface GeneralSuggestionFields {
    id?: number
    suggestion_text: string
    created_at?: ModelDate
    updated_at?: ModelDate
}

export interface GeneralSuggestionMethods {

}

export type GeneralSuggestionModel = Model<GeneralSuggestionFields, GeneralSuggestionMethods>

export class GeneralSuggestion extends BaseModel<GeneralSuggestionFields, GeneralSuggestionMethods> {
    fields = [
        'id',
        'suggestion_text',
        'created_at',
        'updated_at'
    ]

    constructor() {
        super('general_suggestions')
    }

    instanceMethods: GeneralSuggestionMethods = {

    }
}

export default new GeneralSuggestion()