import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({

    id:{
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken:{
        type: String,
    },
    fullName:{
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar:{
        type: String, //clloudnary url
        default: "",
        required: true
    },
    coverImage:{
        type: String, //clloudnary url
    },
    watchHistory:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    }],
}, {
    timestamps: true
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword= async function(password){
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generaateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

const User = mongoose.model("User", userSchema);