const express = require('express');
const { createUser, createResourceRequest, createResourceAvailable } = require('./type.js');
const { User, Resource, ResourceAvailable, Messages, Report, Notifications} = require('./db');
const app = express();
const cors = require('cors');
const { middleWare, emailCheckMiddlware, passwordCheckMiddlware, profileMiddleWare, loginCheck } = require('./middleware.js');
const { JWT_SECRET } = require('./config.js');
const jwt = require("jsonwebtoken");
const { connections } = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { type } = require('os');
const multer = require('multer');
const path = require('path');
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { error, info, timeStamp } = require('console');
const { report } = require('process');
require("dotenv").config();
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.use(cors({
  origin: '*',
}));



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/profile_pics/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }

})

const upload = multer({ storage: storage });



const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})
const users = {};


io.on('connection', (socket) => {
     console.log(`User connected: ${socket.id}`);

    socket.on('join', (userId) => {
        users[userId] = socket.id;
    });

    socket.on('join', (userId) => {
        socket.join(userId);
    })

    socket.on('sendNotification', async({ from, to, type, content }) => {
        const receiverSocketId = users[to];
        await Notifications.create({
            userId: to,
            type:type,
            content:content
        });
        if(receiverSocketId){
            io.to(receiverSocketId).emit('receiveNotification', {
                to,
                content,
                timeStamp: new Date()
            })
        }
    })

    socket.on('send_private_message', async ({ to, from, message }) => {
        const receiverSocketId = users[to];
        await Messages.create({
            sender: from,
            receiver: to,
            message
        });

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_private_message', {
                from,
                message,
                timestamp: new Date()
            });
        }
    });

    socket.on('disconnect', () => {
        for (let key in users) {
            if (users[key] === socket.id) {
                delete users[key];
            }
        }
    });
});

app.get('/retrieveNotifications',profileMiddleWare, async(req, res) => {
    const userId = req.user._id;
    const notifications = await Notifications.findById({userId});
    res.json({
        notifications:notifications
    })
})



function capitalizeName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

app.post('/signup', middleWare, async (req, res) => {
    const createPayload = req.body;
    const parsePayload = createUser.safeParse(createPayload);
    if (!parsePayload.success) {
        return res.status(411).json({
            msg: 'wrong input'
        })
    }
    console.log(req.body)
    const { firstName, lastName, email, zipCode, phoneNumber, password } = req.body;
    
    const formattedFirstName = capitalizeName(firstName);
    const formattedLastName = capitalizeName(lastName);


    await User.create({
        firstName: formattedFirstName,
        lastName: formattedLastName,
        email: email,
        zipCode: zipCode,
        phoneNumber: phoneNumber,
        password: password,
        role: createPayload.role,
        description: createPayload.description,

    })

    res.json({
        msg: "user created successfully"
    })
})

app.post('/login', emailCheckMiddlware, passwordCheckMiddlware, async (req, res) => {

})

app.get('/profile', profileMiddleWare, async (req, res) => {
    const user = req.user;
    res.json({
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        description: user.description,
        connectionsRequests: user.connectionsRequests,
        connections: user.connections,
        resourcesRequested: user.resourcesRequested,
        resourceAvailable: user.resourceAvailable,
        connectionsRequestsSent: user.connectionsRequestsSent,
        notifications: user.notifications,
        profilePic: user.profilePic,
        verified: user.verified,
        backPic:user.backPic
    });
});

app.post('/resourcerequest', profileMiddleWare, async (req, res) => {
    const id = req.user._id;
    const createPayload = req.body;
    const parsePayload = createResourceRequest.safeParse(createPayload);
    if (!parsePayload.success) {
        res.status(411).json({
            msg: 'wrong input'
        })
    }
    const { resourceTitle, resourceLocation } = req.body;
    const formattedResourceTitle = capitalizeName(resourceTitle);
    const formattedResourceLocation = capitalizeName(resourceLocation);


    const resource = await Resource.create({
        resource: createPayload.resource,
        resourceType: createPayload.resourceType,
        resourceTitle: formattedResourceTitle,
        resourceDescription: createPayload.resourceDescription,
        resourceLocation: formattedResourceLocation,
        resourceContactNumber: createPayload.resourceContactNumber,
        resourceTiming: createPayload.resourceTiming,
        resourcePriority: createPayload.resourcePriority,
        userId: id
    })

    const user = req.user;
    user.resourcesRequested.push(resource._id);
    await user.save();

    res.json({ msg: "resource uploaded successfully" });

})

app.get('/resourcerequest', async (req, res) => {
    const response = await Resource.find({});


    res.json({
        todo: response
    })
})

app.put('/editprofile', profileMiddleWare, upload.single('image'), async (req, res) => {
    const { role, description, imageUri,backImageUri } = req.body;
    console.log(imageUri)
    
    const userId = req.user._id;
    
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, {
            role,
            description,
            profilePic:imageUri,
            backPic:backImageUri
        }, { new: true });

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }

})

app.post('/resourceupload', profileMiddleWare, async (req, res) => {
    const id = req.user._id;
    const createPayload = req.body;
    const parsePayload = createResourceAvailable.safeParse(createPayload);
    if (!parsePayload.success) {
        return res.status(411).json({
            msg: "wrong input"
        })
    }
    

    const resource = await ResourceAvailable.create({
        resource: createPayload.resource,
        resourceType: createPayload.resourceType,
        resourceTitle: createPayload.resourceTitle,
        resourceDescription: createPayload.resourceDescription,
        resourceLocation: createPayload.resourceLocation,
        resourceContactNumber: createPayload.resourceContactNumber,
        resourceTiming: createPayload.resourceTiming,
        resourcePriority: createPayload.resourcePriority,
        userId: id
    })

    const user = req.user;

    user.resourceAvailable.push(resource._id);
    await user.save();


    res.json({ msg: "resource uploaded successfully" });
})

app.get('/resourceupload', async (req, res) => {
    const response = await ResourceAvailable.find({});
    res.json({
        todo: response
    })
})

app.get('/myrequestedresources', profileMiddleWare, async (req, res) => {
    const user = await User.findById(req.user._id).populate('resourcesRequested');

    res.json({
        requestedResources: user.resourcesRequested
    });
})

app.get('/myresources', profileMiddleWare, async (req, res) => {
    const user = await User.findById(req.user._id).populate('resourceAvailable');

    res.json({
        resourceAvailable: user.resourceAvailable
    });
})

app.delete('/requestedresourcedelete/:id', profileMiddleWare, async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;


    await Resource.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, {
        $pull: {
            resourcesRequested: id
        }
    })


    res.json({ message: "deleted successfully" })
})

app.delete('/myresourcedelete/:id', async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    await ResourceAvailable.findByIdAndDelete(id);
    await User.findByIdAndUpdate(userId, {
        $pull: {
            resourceAvailable: id
        }
    })
    res.json({ message: "deleted successfully" })
})

app.get('/resourcedetails/:id', async (req, res) => {
    const { id } = req.params;
    const response = await Resource.findById(id);
    const response2 = await ResourceAvailable.findById(id);

    response ? res.json({ todo: response }) : res.json({ todo: response2 });
})

app.get('/fetchusername/:id', async (req, res) => {
    const { id } = req.params;
    const response = await User.findById(id);

    res.json({ todo: response });
})

app.post('/addfriend/:targetUserId', profileMiddleWare, async (req, res) => {
    const senderId = req.user._id;
    const { targetUserId } = req.params;
    const updatedData = req.body;

    await User.findByIdAndUpdate(targetUserId, {
        $addToSet: {
            connectionsRequests: {
                userId: senderId,
                status: 'pending'
            }
        }
    })
    await User.findByIdAndUpdate(senderId, {
        $addToSet: {
            connectionsRequestsSent: {
                userId: targetUserId,
                status: 'pending'
            }
        }
    })
    res.json({ msg: "request sent successfully" })
})

app.get('/connectionsenderdata/:senderId', async (req, res) => {
    const { senderId } = req.params;
    const resposne = await User.findById(senderId);
    res.json({
        msg: resposne
    })
})



app.put('/acceptrequest/:senderId', profileMiddleWare, async (req, res) => {
    const { senderId } = req.params;
    const user = req.user._id;
    await User.findByIdAndUpdate(user, {
        $addToSet: {
            connections: {
                userId: senderId,
                status: 'connected'
            }
        }
    })


    await User.findByIdAndUpdate(user, {
        $pull: {
            connectionsRequests: {
                userId: senderId
            }
        }
    })

    await User.findByIdAndUpdate(senderId, {
        $addToSet: {
            connections: {
                userId: user,
                status: 'connected'
            }
        }
    })
    await User.findByIdAndUpdate(senderId, {
        $pull: {
            connectionsRequestsSent: {
                userId: user
            }
        }
    })


    res.json({ msg: "request accepted" })
})

app.put('/declinerequest/:senderId', profileMiddleWare, async (req, res) => {
    const { senderId } = req.params;
    const user = req.user._id;

    await User.findByIdAndUpdate(user, {
        $pull: {
            connectionsRequests: {
                userId: senderId
            }
        }
    })

    await User.findByIdAndUpdate(senderId, {
        $pull: {
            connectionsRequestsSent: {
                userId: user
            }
        }
    })

    res.json({ msg: "request rejected" })
})

app.put('/addingcomment/:id', profileMiddleWare, async (req, res) => {
    const { id } = req.params;
    const { commentDescription } = req.body;

    const user = req.user._id;
    const resource = await Resource.findById(id);

    await Resource.findByIdAndUpdate(id, {
        $addToSet: {
            comment: {
                userId: user,
                commentDescription: commentDescription,
                createdAt: new Date()
            }
        }
    })

    await User.findByIdAndUpdate(resource.userId, {
        $addToSet: {
            notifications: {
                type: 'comment',
                message: `Your resource ${resource.resourceTitle} has recieved a comment from ${req.user.firstName}`,
                resourceId: id
            }
        }
    })

    res.json({ msg: 'comment added successfully' });
})

app.get('/search/:query', async (req, res) => {
    const { query } = req.params;


    const result = await Resource.find({
        $or: [
            { resourceType: { $regex: query, $options: 'i' } }
        ],
        $or: [{
            resourceDescription: { $regex: query, $options: 'i' }
        }],
        $or: [{
            resourceDescription: { $regex: query, $options: 'i' }
        }],
        $or: [{
            resourceType: { $regex: query, $options: 'i' }
        }]
    });
    const result2 = await ResourceAvailable.find({
        $or: [
            { resourceType: { $regex: query, $options: 'i' } }
        ],
        $or: [{
            resourceDescription: { $regex: query, $options: 'i' }
        }],
        $or: [{
            resourceDescription: { $regex: query, $options: 'i' }
        }],
        $or: [{
            resourceType: { $regex: query, $options: 'i' }
        }]
    });
    res.json([...result, ...result2])
});

app.get('/messages/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    const messages = await Messages.find({
        $or: [
            { sender: user1, receiver: user2 },
            { sender: user2, receiver: user1 }
        ]
    }).sort({ timestamp: 1 });

    res.json(messages);
})

app.get('/messages', profileMiddleWare, async (req, res) => {
    const user = req.user._id;
    const todo = await Messages.find({
        $or: [
            { sender: user }
            //   {receiver: user}
        ]
    })
    res.json({ msg: todo })
})

app.get('/allmessages', profileMiddleWare, async (req, res) => {
    const user = req.user.id;
    const messages = await Messages.find({
        $or: [
            { sender: user }
        ]
    })
})

app.put('/disconnect/:userId/:deleteId', async (req, res) => {
    const { userId, deleteId } = req.params;
    await User.findByIdAndUpdate(userId, {
        $pull: {
            connections: { userId: deleteId }
        }
    })
    await User.findByIdAndUpdate(deleteId, {
        $pull: {
            connections: { userId: userId }
        }
    })

    res.json({ msg: "connection removed successfully" })
})

app.get('/connection-status/:senderId', profileMiddleWare, async (req, res) => {
    const { senderId } = req.params;
    console.log(senderId)
    const userId = req.user._id;
    const user = await User.findById(userId);
    const isConnected = user.connections.find(
        (conn) => conn.userId.toString() === senderId
    );
    if (isConnected) return res.json({ status: 'Connected' });

    const requestStatus = user.connectionsRequestsSent.find(
        (req) => req.userId.toString() === senderId
    );
    if (requestStatus) {
        return res.json({ status: 'Pending' });
    }
    return res.json({ status: 'Connect +' });

})

app.post('/upvote', profileMiddleWare, async (req, res) => {
    const { resourceId, voteType } = req.body;
    const userId = req.user._id;

    const resource = await Resource.findById(resourceId) || await ResourceAvailable.findById(resourceId);
    const alreadyVoted = resource.votes;

    if (!resource) return res.status(404).json({ msg: 'Resource not found' });

    resource.votes = resource.votes.filter(v => v.userId.toString() !== userId.toString());

    const hasVoted = alreadyVoted.some(obj => obj.userId.toString() === userId.toString());



    if (!hasVoted) {
        await User.findByIdAndUpdate(resource.userId, {
            $addToSet: {
                notifications: {
                    type: 'upvote',
                    message: `Your resource ${resource.resourceTitle} has recieved a upvote from ${req.user.firstName}`,
                    resourceId: resourceId
                }
            }
        })
    } else {
        return
    }

    // user.notifications.push({
    //     type:'upvote',
    //     message:`Your resource ${resource.resourceTitle} has recieved a upvote from ${req.user.firstName}`,
    //     resourceId:resourceId
    // })



    resource.votes.push({ userId, voteType });


    await resource.save();
    res.json({ msg: 'upvoted', votes: resource.votes });
})

app.get('/searchusers', async (req, res) => {
    const query = req.query.q;
    const users = await User.find({
        $or: [{ firstName: { $regex: query, $options: "i" } }, { lastName: { $regex: query, $options: "i" } }]
    })

    res.json(users);
})

let otpStore = {};

const transpoter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = generateOTP();
    delete otpStore[email];


    otpStore[email] = otp;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: ' OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transpoter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending mail:", error);
            res.status(500).send("Failed to send OTP");
        } else {
            res.send("OTP sent successfully");
        }
    })
})

app.post('/verify-otp', async (req, res) => {
    const { email, otp, userId } = req.body;


    if (otpStore[email] === otp) {
        delete otpStore[email];
        await User.updateOne({ email: email }, { verified: true });
        res.send({ msg: "Email verified successfully" })
    } else {
        res.status(400).send({ msg: "Invalid OTP!" })

    }
});

app.post('/report/:resourceId', profileMiddleWare, async (req, res) => {
    const { data, reportType, message, reportedUserId } = req.body;
    const { resourceId } = req.params;
    await Report.create({
        reportedBy: req.user._id,
        reportedUserId: reportedUserId,
        reportType: reportType,
        resource: resourceId,
        message: message,
        reason: data,
    })
    res.send({ msg: 'reported successfully' })

})

app.get('/resources-data', async (req, res) => {
    const response1 = await Resource.find({});
    const response2 = await ResourceAvailable.find({});
    const users = await User.find({});
    const reports = await Report.find({
        status: 'pending'
    })

    const resource = [...response1, ...response2];

    res.json({
        resource: resource,
        users: users,
        reports: reports
    })
})

app.get('/reports', async (req, res) => {
    const response = await Report.find({});
    const pending = await Report.find({
        status: 'Pending'
    })
    const approved = await Report.find({
        status: 'Approved'
    })
    const rejected = await Report.find({
        status: 'Rejected'
    })

    res.json({
        reports: response,
        pending: pending,
        approved: approved,
        rejected: rejected
    })
})

app.get('/report/:reportId/:reportedUserId/:resourceId', async (req, res) => {
    const { reportId, reportedUserId , resourceId} = req.params;

    const reportIdDetail = await Report.findById(reportId);
    const reportedUserIdDetail = await User.findById(reportedUserId);
    const reportedResourceDetail = await Resource.findById(resourceId);
    res.json({
        reportIdDetail:reportIdDetail,
        reportedUserIdDetail:reportedUserIdDetail,
        reportedResourceDetail: reportedResourceDetail
    })

})



app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});