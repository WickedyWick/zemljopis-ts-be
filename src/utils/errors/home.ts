import httpStatus from "http-status";
import { ApiError } from ".";

export const ERROR_ROOM_CREATE =  new ApiError({
    name: 'ERROR_ROOM_CREATE',
    message: 'Error during creating room, please try again!',
    status: httpStatus.INTERNAL_SERVER_ERROR
})