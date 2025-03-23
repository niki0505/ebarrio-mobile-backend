//USER ACCOUNTS SCHEMA
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AutoIncrement from "mongoose-sequence";

const connection = mongoose.connection;

const userSchema = new mongoose.Schema(
  {
    accID: {
      type: Number,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    resID: {
      type: Number,
      unique: true,
    },
  },
  { versionKey: false }
);

//accID auto-increment
userSchema.plugin(AutoIncrement(connection), { inc_field: "accID" });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

export default User;
