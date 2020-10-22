const p = require('../package');
module.exports = {
    app: {
        name: p.name,
        description: p.description,
        version: p.version
    },
    server: {
        port: process.env.NODE_APP_INSTANCE || 5005
    },
    moderation: {
        regionOCRModeration: {
            base_dir: "C:\\Users\\kuanysh\\Desktop\\dataset",
            options: {
                //region_id: ["kz"],
                //state_id: ["not filled", "filled", "garbage", "empty"],
                //count_lines: ["1", "2", "3"]
            }
        },
        template: {
            //tags:[],
            //objects:[],
            //"name":"",
            //"description":"",
            //state_id:  0,
            //region_id: 0,
            size:{
                width:  0,
                height: 0
            },
            moderation:{
                isModerated:0,
                moderatedBy:"Norlist",
                predicted: ""
            }
        }
    },
};
