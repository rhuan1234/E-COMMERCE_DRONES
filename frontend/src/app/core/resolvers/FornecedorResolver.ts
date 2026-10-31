import { ResolveFn } from "@angular/router";
import { Fornecedor } from "../models/fornecedor/FornecedorRequest";
import { FornecedorService } from "../services/FornecedorService";
import { inject } from "@angular/core/primitives/di";

export const fornecedorResolver: ResolveFn<Fornecedor> = route => {
    return inject(FornecedorService).findById(route.paramMap.get('id'));
}