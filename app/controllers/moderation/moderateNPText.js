const config  = require('config'),
    path = require("path"),
    fs = require("fs"),
    sizeOf = require('image-size'),
    base64Img = require('base64-img'),
    axios = require('axios');



function chencheAnnotation (img, ann, chended_numbers, template, deleted_path) {
    console.log(ann, chended_numbers, template)
    if (chended_numbers) {
        for (let k in chended_numbers) {
            const f = chended_numbers[k];
            const number = f.number;
            const newNumber = f.newNumber;
            const img_base64 = f.croped;
            if (img_base64){
                
                if (fs.existsSync(path.join(img, `${number}.jpg`))) {
                    filename = path.join(img, `${number}.jpg`);
                    var ext = img_base64.split(';')[0].match(/jpeg|png|gif/)[0];
                    fs.unlinkSync(filename, function (err) {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                
                    var data_base64 = img_base64.replace(/^data:image\/\w+;base64,/, "");
                    var buf = new Buffer(data_base64, 'base64');
                    fs.writeFileSync(filename, buf, function (err) {
                        if (err) throw err
                        console.log('saved!')
                    });
                }
            }
            if (fs.existsSync(path.join(img, `${number}.jpg`))) {
                if (Boolean(Number(f.deleted))) {
                    console.log(f.deleted);
                    fs.renameSync(path.join(img, `${number}.jpg`), path.join(deleted_path, `${number}.jpg`), function (err) {
                        if (err) throw err
                        console.log('Successfully renamed - AKA moved!')
                    })
                    //fs.unlinkSync(path.join(img, `${number}.jpg`));
                    if (fs.existsSync(path.join(ann, `${number}.json`))) {
                        fs.unlinkSync(path.join(ann, `${number}.json`));
                    }
                } else {
                    //const dimensions = 0;
                    
                    var dimensions = sizeOf(path.join(img, `${number}.jpg`));
                    console.log(dimensions);
                
                    
                    let data;
                    if(fs.existsSync(path.join(ann, `${number}.json`))) {
                        data = Object.assign({}, template, JSON.parse(fs.readFileSync(path.join(ann, `${number}.json`))));
                    } else {
                        data = Object.assign({}, template);
                    }
                    data.size = {
                        width: dimensions.width,
                        height: dimensions.height
                    };
                    const options = config.moderation.regionOCRModeration.options;
                    for (let key in options) {
                        data[key] = f[key];
                    }
                    data.description = newNumber;
                    data.name = number;
                    data.moderation = Object.assign({},data.moderation || {}, {isModerated: 1});
                    //console.log(JSON.stringify(data));
                    fs.writeFileSync(path.join(ann, `${number}.json`), JSON.stringify(data));
                }
            }
        }
    }
}

module.exports = function(ctx, next) {
    const base_dir = config.moderation.regionOCRModeration.base_dir;
    const max_files_count = ctx.request.body.max_count || 1;
    const chended_numbers = ctx.request.body.chended_numbers;

    const img = path.join(base_dir, "/img/");
    const ann = path.join(base_dir, "/ann/");
    const deleted_path = path.join(base_dir, "/deleted/");
    let template = Object.assign({}, config.moderation.template);

    // checkers
    if (!fs.existsSync(base_dir)) {
        ctx.body = {
            message: `Path to '${base_dir}' not exists`
        };
    }
    if (!fs.existsSync(img)) {
        fs.mkdirSync(img);
        ctx.body = {
            message: `Image dir '${img}' empty`
        };
    }

    if (!ctx.body) {
        if (!fs.existsSync(ann)) {
            fs.mkdirSync(ann);
        }
        chencheAnnotation(img, ann, chended_numbers, template, deleted_path);

        console.log(template);
        const files = fs.readdirSync(img);

        const res = [];
        let count = 0;
        for (let i in files) {

            const f = files[i];
            const number = f.substring(0, f.length - 4);

            const jsonPath = path.join(ann, `${number}.json`);
            const imgPath = path.join(img, `${number}.jpg`);

            let data = {};
            if (!fs.existsSync(jsonPath)) {
                data = template;
            } else {
                data = Object.assign({}, template, JSON.parse(fs.readFileSync(jsonPath)));
            }
            if (!data.moderation || !data.moderation.isModerated) {
                const data_item = {
                    img_path: `img/${f}`,
                    name: number,
                    predicted: data.moderation === undefined ? "" : data.moderation.predicted || "",
                    description: data.description,
                };
                console.log(data_item);
                const options = config.moderation.regionOCRModeration.options;
                for (let key in options) {
                    data_item[key] = data[key];
                }
                res.push(data_item)
            } else {
                count++;
            }
        }

        //console.log(iter);
        ctx.body = {
            expectModeration: files.length - count,
            data:res.slice(0, max_files_count),
            options: config.moderation.regionOCRModeration.options,
            user: template.moderation.moderatedBy || "defaultUser"
        };
        console.log("___________________");
    }

    next();
};

