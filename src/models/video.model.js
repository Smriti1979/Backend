import mongoose, {Schema} from "mongoose";
import mongoosePaginateAggregate from "mongoose-paginate-aggregate-v2";

const videoSchema = new Schema({
    id:{
        type:String,
        required: true,
        unique: true,
        index: true
    },
    videoFile: {
        type:String, //cloudinary url
        required: true
    },
    thumbnail: {
        type:String, //cloudinary url
        required: true
    },
    title: {
        type:String,
        required: true,
    },
    description: {
        type:String,
        required: true,
    },
    duration:{
        type: Number,
        required: true
    },
    views:{
        type: Number,
        default: 0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true
})

videoSchema.plugin(mongoosePaginateAggregate);

const Video = mongoose.model("Video", videoSchema);