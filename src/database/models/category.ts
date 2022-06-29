import { Model, BaseModel } from 'database/model'

export interface CategoryFields {
    id: number
    category: string
}

export interface CategoryMethods {

}

export type CategoryModel = Model<CategoryFields, CategoryMethods>

export class Category extends BaseModel<CategoryFields, CategoryMethods> {
    fields = [
        'id',
        'category'
    ]

    constructor () {
        super('category')
    }

    instanceMethods = {

    }
}

export default new Category()