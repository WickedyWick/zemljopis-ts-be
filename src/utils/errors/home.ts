import httpStatus from "http-status";
import { ApiError } from ".";

export const ERROR_ROOM_CREATE = new ApiError({
    name: 'ERROR_ROOM_CREATE',
    message: 'Error during creating room, please try again!',
    status: httpStatus.INTERNAL_SERVER_ERROR
})

export const ERROR_REG_PLAYER = new ApiError({
    name: 'ERROR_ROOM_CREATE',
    message: 'Error during registering player',
    status: httpStatus.INTERNAL_SERVER_ERROR
})

export const ERROR_UNDEFINED_PARAMS = new ApiError({
    name: 'ERROR_REG_PLAYER',
    message: 'Bad paramaters during registering player',
    status: httpStatus.BAD_REQUEST
})