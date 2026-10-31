import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";

export const authInterceptor: HttpInterceptorFn = 
    (req: HttpRequest<any>, next: HttpHandlerFn)=> {

        if (req.url.includes('/auth/login') || req.url.includes('viacep.com.br')) {
            return next(req);
        }
        
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