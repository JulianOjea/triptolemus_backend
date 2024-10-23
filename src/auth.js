import jwt from 'jsonwebtoken';

//Middleware JWT 
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).send('Authentication required.');
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send('Invalid token.');
      }
      req.user = decoded;
      next();
    });
  };
  