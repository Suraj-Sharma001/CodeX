declare module "cookie-parser" {
  import { RequestHandler } from "express";
  function cookieParser(
    secret?: string | string[],
    options?: object
  ): RequestHandler;
  export = cookieParser;
}
