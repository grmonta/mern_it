const jwt = require('jsonwebtoken');
const config = require('config');

//since it's middle ware it takes in req, res, and next - the callback once to do when done
//this is a function that gets token from the header, to verify
//if not token it won't respond an answer

//
module.exports = function(req, res, next) {
  //get token from header set the header key
  const token = req.header('x-auth-token');

  //Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }
  //verify toekn
  try {
    //verify takes token, and your secret JWT
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    //set decoded user to req.user so can use on
    //protected routes
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
