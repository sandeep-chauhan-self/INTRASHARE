import getPrismaInstance from "../utils/PrismaClient.js";
import bcrypt from 'bcryptjs';

function hashPassword(password, saltRounds) {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) console.error(err);
      else 
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) reject(err);
          else resolve(hash);
        });
    });
  });
} 

async function checkPassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, function(err, isMatch) {
        if (err) {
          reject(err); // Reject the promise with the error
        } else {
          resolve(isMatch); // Resolve the promise with the result
        }
      });
    });

    if (!isMatch) {
      console.log("Password doesn't match!");
      return isMatch
    }

    console.log("Password matches!");
    return isMatch; // Return the result if passwords match
  } catch (error) {
    console.error(error);
  }
}

 
export const checkUser = async (req, res, next) => {
  try {
    var { eId, password } = req.body;
    if (!eId) {
      return res.json({ msg: "Employee ID is required", status: false });
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findFirst({ where: { eId } });

    if (!user) {
      return res.json({ msg: "User not found", status: false });
    } else if (!user.isActive) {
      return res.json({ msg: "User not found", status: false });
    } else {

      checkPassword(password, user.password)
    .then(match => {
        if (match) {
          req.session.userInfo = user;
          console.log("req.session.userInfo", req.session.userInfo);
           return res.json({ msg: "User found", status: true, onBoarding: user.onBoarding });
        } else {
          return res.json({ msg: "Incorrect Passowrd", status: false });
        }
    });
    }
  } catch (error) {
    next(error);
  }
};

export const session = async (req, res, next) => {
  try {
    if (req.session.userInfo){
      return res.json({ status: true, userInfo: req.session.userInfo });
    }
  } catch{
    console.error(error);
  }
}

export const onBoardUser = async (req, res, next) => {
  try {
    var { eId, name, about = "Available", image: profilePicture, password } = req.body;
    const prisma = getPrismaInstance();

    const saltRounds = 10;
    const bcryptPassword = await hashPassword(password, saltRounds);
    
    await prisma.user.update({
      where: { eId: eId },
      data: { name, about, profilePicture, onBoarding: 1, password: bcryptPassword }
    });

    return res.json({ msg: "Success", status: true });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();
    const users = await prisma.user.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        profilePicture: true,
        about: true,
      },
    });
    const usersGroupedByInitialLetter = {};
    users.forEach((user) => {
      const initialLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initialLetter]) {
        usersGroupedByInitialLetter[initialLetter] = [];
      }
      usersGroupedByInitialLetter[initialLetter].push(user);
    });

    return res.status(200).send({ users: usersGroupedByInitialLetter });
  } catch (error) {
    next(error);
  }
};