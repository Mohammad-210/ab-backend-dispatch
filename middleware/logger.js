const logger = (req, res, next) => {
   console.log(
      `➡️  ${req.method} ${req.url} from ${
         req.headers["x-forwarded-for"] || req.socket.remoteAddress
      }`
   );
   next();
};

module.exports = logger;
