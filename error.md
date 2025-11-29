[12/13] RUN npm run build

> zerocraft_be@1.0.0 build
> tsc && prisma generate

src/routes/businessPlans.routes.ts(19,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(20,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(72,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(73,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(115,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(116,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/businessPlans.routes.ts(217,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(218,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(294,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(295,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(348,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/businessPlans.routes.ts(349,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(96,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(98,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(123,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/coupons.routes.ts(125,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(173,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(175,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/coupons.routes.ts(233,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/coupons.routes.ts(235,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/credits.routes.ts(12,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/credits.routes.ts(13,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/credits.routes.ts(53,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/credits.routes.ts(54,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/credits.routes.ts(93,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/credits.routes.ts(94,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/favorites.routes.ts(17,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/favorites.routes.ts(18,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/favorites.routes.ts(65,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/favorites.routes.ts(66,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/favorites.routes.ts(112,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/favorites.routes.ts(113,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/favorites.routes.ts(146,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/favorites.routes.ts(147,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/mypage.routes.ts(12,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/mypage.routes.ts(13,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/payments.routes.ts(33,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/payments.routes.ts(34,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/payments.routes.ts(100,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/payments.routes.ts(101,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.

src/routes/payments.routes.ts(181,3): error TS2769: No overload matches this call.
The last overload gave the following error.
Argument of type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to parameter of type 'RequestHandlerParams<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Type '(req: AuthRequest, res: Response, next: NextFunction) => Promise<void>' is not assignable to type 'RequestHandler<ParamsDictionary, any, any, ParsedQs, Record<string, any>>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
src/routes/payments.routes.ts(182,16): error TS2345: Argument of type '(req: AuthRequest, res: Response) => Promise<void>' is not assignable to parameter of type '(req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: Response<any, Record<string, any>>, next: NextFunction) => Promise<...>'.
Types of parameters 'req' and 'req' are incompatible.
Type 'Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>' is not assignable to type 'AuthRequest'.
Types of property 'user' are incompatible.
Type 'User | undefined' is not assignable to type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; } | undefined'.
Type 'User' is missing the following properties from type '{ name: string; id: string; email: string; profileImage: string | null; googleId: string | null; credits: number; role: string; createdAt: Date; updatedAt: Date; }': name, id, email, profileImage, and 5 more.
