import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = 
    (req: HttpRequest<any>, next: HttpHandlerFn)=> {
        const token = localStorage.getItem('token');
        if(token){
            const request = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            })
            return next(request);
        }
        return next(req);
        
    }