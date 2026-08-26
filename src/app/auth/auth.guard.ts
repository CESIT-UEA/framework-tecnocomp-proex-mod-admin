import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ApiAdmService } from '../services/api-adm.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};

export const resetPasswordGuard: CanActivateFn = (route, state) => {
    const apiAdmService = inject(ApiAdmService)
    const router = inject(Router)

    const email = route.queryParamMap.get('email');
    const token = route.queryParamMap.get('token');

    if (!email || !token) {
      router.navigate(['/login'], { replaceUrl: true });
      return false;
    }
    
    return apiAdmService.validaLinkRedefinirSenha(email, token).pipe(
      map((data) => {
        if (data.redirect == '/login'){
            router.navigate(['/login'], { replaceUrl: true })
            apiAdmService.message('Não foi possível redefinir a senha. O link pode ter expirado!')
            return false
        }
        return true
      })
    )
}
