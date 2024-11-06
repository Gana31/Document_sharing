import bcrypt from 'bcryptjs'
import { DataTypes } from 'sequelize';
import jwt from "jsonwebtoken"
import { sequelize } from '../../../config/databaseconfig.js';
import ServerConfig from '../../../config/ServerConfig.js';
const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const random_profile = () => {
  const img_urls = [
    "https://cdn2.iconfinder.com/data/icons/avatars-60/5985/2-Boy-512.png",
    "https://cdn2.iconfinder.com/data/icons/avatars-60/5985/4-Writer-1024.png",
    "https://cdn2.iconfinder.com/data/icons/avatars-60/5985/40-School_boy-512.png",
    "https://cdn2.iconfinder.com/data/icons/avatars-60/5985/12-Delivery_Man-128.png",
    "https://cdn1.iconfinder.com/data/icons/user-pictures/100/boy-512.png",
  ];
  const idx = Math.floor(Math.random() * img_urls.length);
  return img_urls[idx];
};

const UserModel = sequelize.define('users', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notNull: { msg: "Email is required" },
        notEmpty: { msg: "Email is required" },
        isEmail: function (value) {
          if (value !== "" && !validateEmail(value)) {
            throw new Error("Invalid Email Address");
          }
        },
        async isUnique(value) {
          const existingUser = await UserModel.findOne({
            where: {
              email: value,
              deletedAt: null,
              isActive: true,
            },
          });
          if (existingUser) {
            throw new Error("Email already in use!");
          }
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8],
          msg: "Password must be at least 8 characters long",
        },
        notNull: { msg: "Password is Required" },
        notEmpty: { msg: "Password is Required" },
      },
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: random_profile(),
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mobile_no: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        async isUnique(value) {
          if (value) {
            const existingUser = await UserModel.findOne({
              where: {
                mobile_no: value,
                isActive: true,
                deletedAt: null,
              },
            });
            if (existingUser) {
              throw new Error("Mobile number already in use!");
            }
          }
        },
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    account_type: {
      type: DataTypes.ENUM("User", "Admin"),
      allowNull: false,
      defaultValue: 'User',
      validate: {
        isIn: {
          args: [["User", "Admin"]],
          msg: "Role must be one of: User, or Admin",
        },
      },
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ["password"] },
      },
    },
  });

  UserModel.addHook('beforeCreate', async (user) => {
    user.avatar = random_profile();
    if (user.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  UserModel.prototype.getJWTToken = function () {
    return jwt.sign({ userId: this.id },ServerConfig.ACCESS_TOKEN_SECRET);
  };
  UserModel.prototype.getAccessToken = function () {
    return jwt.sign({ userId: this.id }, ServerConfig.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
  };
  
  UserModel.prototype.getRefreshToken = function () {
    return jwt.sign({ userId: this.id }, ServerConfig.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  };
  
  UserModel.prototype.comparePassword = async function (enteredPassword) {
    console.log("password", enteredPassword, this.password);
    return await bcrypt.compare(enteredPassword, this.password);
  };

  export default UserModel;