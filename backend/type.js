const zod = require('zod');

const createUser = zod.object({
    firstName: zod.string().min(3),
    lastName: zod.string().min(3),
    email: zod.string().email(),
    zipCode: zod.string().length(6),
    phoneNumber: zod.string().min(10),
    password: zod.string().min(8)
})

const createResourceRequest = zod.object({
    resource: zod.string(),
    resourceType: zod.string(),
    resourceTitle: zod.string(),
    resourceDescription: zod.string(),
    resourceLocation: zod.string(),
    resourceContactNumber: zod.string(),
    resourceTiming: zod.string(),
    resourcePriority: zod.string()

})

const createResourceAvailable = zod.object({
    resource: zod.string(),
    resourceType: zod.string(),
    resourceTitle: zod.string(),
    resourceDescription: zod.string(),
    resourceLocation: zod.string(),
    resourceContactNumber: zod.string(),
    resourceTiming: zod.string(),
    resourcePriority: zod.string()

})

module.exports = {
    createUser, createResourceRequest, createResourceAvailable
}