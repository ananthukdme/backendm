module.exports = function (app, db) {
    const path = require('path');
    var ObjectID = require("mongodb").ObjectID;
    var multer = require('multer');
    const userdetails = "clnuserdetails";
    const rolesCollection = "clnrolesCollection"
    const formidable = require('formidable');
    var multiparty = require('multiparty');
    const uniqid = require('uniqid');
    const CLN_IMAGE = "clnImage"
    const sharp = require('sharp')
    const user_assigned_doc = "clnuser_assigned_doc"
    var async = require('async');
    const cron = require("node-cron");


    // cron.schedule("* * * * *", function() {
    //     console.log("running a task every minute");
    //     var currentDate = moment(new Date()).utcOffset(+330).format('YYYY-MM-DD');
    //     db.collection(rolesCollection).find(datas).toArray().then(data => {
    //   });

 //write a function to  change the status of image to 0 when the image is 2 days old

 app.post('/deleteImage', (req, res) => {
    var todayDate =new Date
     db.collection(CLN_IMAGE).find({"created_date" : { $lt :todayDate  }}).toArray().then(data=>{
         console.log(data,"thats the IMAGE DETAILS");
 }
 )})



    // app.post('/cron', (req, res, next) => {
    //     let date = new Date(2017, 10, 28, 12, 39)
    //     var job = new CronJob(date, function () {
           
    //     }, function () {
    //         /* This function is executed when the job stops */
    //     },
    //         true,
    //         "Asia/Kolkata" /* Start the job right now */
    //     );
    //     job.start();
    //     res.end();
    // })
    //login admin
    app.post('/login', (req, res) => {

        console.log(req.body, "thats suceesss")
        let data = req.body
        if ((!data.username) || (!data.password)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let datas = {
                "username": data.username,
                "password": data.password
            }


            db.collection(rolesCollection).find(datas).toArray().then(data => {
                console.log("thats the admin data", data)
                if (data.length) {
                    res.status(200).json({ status: true, message: "login success", data: data })
                }
                else
                    res.status(200).json({ status: false, message: "invalid userd", data: data })
            })





        }

    })

    //admin role assign ----add user
    app.post('/roleSignup', (req, res) => {

        console.log(req.body, "thats suceesss")
        let data = req.body
        if ((!data.username) || (!data.password) || (!data.role)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let newData = {
                "username": data.username,
                "password": data.password,
                "role": data.role,
                "createdDate": new Date,
                "status": true
            }
            console.log("newdata", newData)
            db.collection(rolesCollection).insert(newData, (err, result) => {
                if (err) res.status(500).json({ status: false, message: "something went wrong" })
                else {
                    console.log(newData);

                    res.status(200).json({ status: true, message: "sign up successfull", newData })
                }
            })
        }

    })

    //

    //------------view roles user

    app.get('/viewRoles', (req, res) => {

        let datas = {
            "role": "user"
        }
        db.collection(rolesCollection).find(datas, {}).toArray().then(data => {
            if (data.length >= 0) {
                console.log("thats the assigned roles data", data)
                res.status(200).json({ status: true, message: "User details", data: data })
            }
            else {
                res.status(200).json({ status: false, message: "no user found", data: data })
            }

        })



    })
    //assign a task file to a user
    app.post('/assignTask', (req, res) => {
        let data = req.body;
        if ((!data.userId) || (!data.imageId)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let newData = {
                "userId": data.userId,
                "imageId": data.imageId,
                "createdDate": new Date
            }
            db.collection(user_assigned_doc).insert(newData, (err, result) => {
                if (err) res.status(500).json({ status: false, message: "something went wrong" })
                else {


                    res.status(200).json({ status: true, message: "Task assigned " })
                }
            })
        }
    })

    //assign a task to all the users
    app.post('/assignTaskAllRoles', (req, res) => {
        let datar = req.body;
        resultData = []
        if (!datar.imageId) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            let datas = {
                "role": "user"
            }
            db.collection(rolesCollection).find(datas, {}).toArray().then(data => {
                if (data.length >= 0) {

                    console.log("thats the assigned roles data", data)
                  let nomoRea =  data.map(item => {
                      console.log(item,"thats the item")
                        resultData.push({
                            "userId": item._id,
                            "imageId": datar.imageId
                        });
                       
                       
                        
                    })
                   if(resultData.length>0){
                    db.collection(user_assigned_doc).insertMany(resultData, (err, result) => {
                                    if (err) res.status(500).json({ status: false, message: "something went wrong" })
                                    else {
                    
                    
                                        res.status(200).json({ status: true, message: "Task assigned to all " })
                    
                }
            })}
            else{
                res.status(500).json({ status: false, message: "something went wrong" })
            }
        }
    })
        }})
    //view task assigned to the user 

    app.post('/viewTask', (req, res) => {
        let data = req.body;
        console.log(data, '>>>>>>>')
        if ((!data.userId) || (!data.role)) { res.status(500).json({ status: false, message: "Please enter the correct details" }) }
        else {
            if (data.role === "admin") {
                var newData = {

                }

            } else {
                var newData = {
                    "userId": ObjectID(data.userId)
                }
            }

            db.collection(user_assigned_doc).find(newData, {}).toArray().then(data => {
                if (!data) res.status(500).json({ status: false, message: "no data found" })
                else {
                    res.status(200).json({ status: true, message: "Displaying the tasks assigned", data })
                }
            })
        }
    })



    //upload image
    app.post("/upload-image", function (req, res, next) {
        var form = new formidable.IncomingForm();
        let activeUserId = '';

        form.parse(req, function (err, fields, files) { activeUserId = fields.activeUserId });
        form.on('error', function (err) {
            res.status(200).json({ status: true, message: "Required parameter does not exist" })
        });
        form.on('end', function (fields, files) {
            if (this.openedFiles.length <= 0) res.status(200).json({ status: true, message: "Image upload failed" })
            else {
                let temp_path = this.openedFiles[0].path;
                console.log("temp path", temp_path)
                let fileName = this.openedFiles[0].name;

                var dirctory = '../public/images/'

                fileName = fileName.split('.');
                let fileUniqueName = uniqid();
                console.log("unique image id", fileUniqueName)
                sharp(temp_path)
                    .toFile(path.join(__dirname, dirctory + fileUniqueName), function (err) {
                        if (err) errorBlock(res, err, 'Error while resizing image')
                        else {
                            let inserdata = {
                                imageId: fileUniqueName,
                                created_date: new Date(),
                                updated_date: new Date(),
                                deleted_date: null,
                                status: 1

                            }
                            db.collection(CLN_IMAGE).insert(inserdata);
                            res.status(200).json({ status: true, message: "Image uploaded success", data: { imageId: fileUniqueName } })

                        }
                    })


            }




        });
    });







}

