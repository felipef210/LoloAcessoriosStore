import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SecurityService } from '../../core/services/security.service';

export const isLoggedOutGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const securityService = inject(SecurityService);

  if(!securityService.isLoggedIn())
    router.navigate(['/']);

  return true;
};
