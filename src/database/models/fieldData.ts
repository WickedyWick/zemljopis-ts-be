import { Model, BaseModel } from 'database/model'

export interface FieldDataFields {
    id: number
    data: string
    letter: string
    category_id: number
}

export interface FieldDataMethods {

}

export type FieldDataModel = Model<FieldDataFields, FieldDataMethods>

export class FieldData extends BaseModel<FieldDataFields, FieldDataMethods> {
    fields: [
        'id',
        'data',
        'letter',
        'category_id'
    ]

    constructor () {
        super('field_data')
    }

    instanceMethods = {

    }
}

export default new FieldData()