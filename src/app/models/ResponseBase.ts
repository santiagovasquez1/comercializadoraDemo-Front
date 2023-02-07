import { HttpStatusCode } from "@angular/common/http";

export interface ResponseBase {
    message: string;
    HttpStatusCode: HttpStatusCode
}