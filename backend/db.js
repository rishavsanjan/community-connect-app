const mongoose = require('mongoose');
const { boolean } = require('zod');

mongoose.connect('mongodb+srv://admin:admin@cluster0.9b9lukf.mongodb.net/community-test')

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    zipCode: String,
    phoneNumber: String,
    password: String,
    role: String,
    description: String,
    verified: {
        type: Boolean,
        default: false
    },
    profile: {
        type: String
    },
    resourcesRequested: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource'
    }],
    resourceAvailable: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ResourceAvailable'
    }],
    connectionsRequests: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'connected', 'connect+'],
            default: 'connect+'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    connectionsRequestsSent: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'connected', 'connect+'],
            default: 'connect+'
        },
        requestedAt: {
            type: Date,
            default: Date.now
        }
    }],
    connections: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        status: {
            type: String,
            default: 'connected'
        }
    }],
    notifications: [{
        type: {
            type: String,
            required: true
        },
        message: String,
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            ref: 'ResourceAvailable',
            required: true
        },
        isRead: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]

}, { timestamps: true });


const ResourceSchema = new mongoose.Schema({
    resource: String,
    resourceType: String,
    resourceTitle: String,
    resourceDescription: String,
    resourceLocation: String,
    resourceContactNumber: String,
    resourceTiming: String,
    resourcePriority: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    comment: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        commentDescription: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }], votes: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] }
    }]


}, { timestamps: true });

const ResourceAvailableSchema = new mongoose.Schema({
    resource: String,
    resourceType: String,
    resourceTitle: String,
    resourceDescription: String,
    resourceLocation: String,
    resourceContactNumber: String,
    resourceTiming: String,
    resourcePriority: String,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        commentDescription: {
            type: String
        }
    }],
    votes: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        voteType: { type: String, enum: ['upvote', 'downvote'] }
    }]

}, { timestamps: true });

const MessagesSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const ReportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: String,
    reportType: {
        type: String
    },
    resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource' || 'ResourceAvailable',
        required: true
    },
    reason: {
        type: Array,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }
    ,
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const NotificationsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['message', 'friend_request', 'vote', 'comment'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})





const User = mongoose.model('User', UserSchema);
const Resource = mongoose.model('Resource', ResourceSchema);
const ResourceAvailable = mongoose.model('ResourceAvailable', ResourceAvailableSchema);
const Messages = mongoose.model('Messages', MessagesSchema);
const Report = mongoose.model('Report', ReportSchema);
const Notifications = mongoose.model('Notifications', NotificationsSchema);

module.exports = {
    User, Resource, ResourceAvailable, Messages, Report, Notifications
}