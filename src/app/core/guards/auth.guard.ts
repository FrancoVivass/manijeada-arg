import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  // Check if we have a session in Supabase (async)
  try {
    const { data: { user } } = await authService.supabase.auth.getUser();
    if (user) {
      authService.currentUser.set(user);
      return true;
    }
  } catch (e) {
    console.error('Error in auth guard check:', e);
  }

  // Redirect to login only if we are sure there is no user
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

