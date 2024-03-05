var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { eq } from 'drizzle-orm';
import { db } from '../../dbConnection.js';
import { users } from './schema.js';
//INSERT A USER INTO DB
export function insertUser(u) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.insert(users).values(u);
    });
}
//SELECT SINGLE USER
export function selectUser(mail) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.select().from(users).where(eq(users.mail, mail));
    });
}
export function selectAllUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.select().from(users);
    });
}
