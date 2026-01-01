import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
      }
    ]
  },
  {
    path: 'game',
    canActivate: [authGuard],
    children: [
      {
        path: 'roulette/setup',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'cards/setup',
        loadComponent: () => import('./features/game/cards/setup/cards-setup.component').then(m => m.CardsSetupComponent)
      },
      {
        path: 'impostor/setup',
        loadComponent: () => import('./features/game/impostor/setup/impostor-setup.component').then(m => m.ImpostorSetupComponent)
      },
      {
        path: 'mimic/setup',
        loadComponent: () => import('./features/game/mimic/setup/mimic-setup.component').then(m => m.MimicSetupComponent)
      },
      {
        path: 'lobby/:id',
        loadComponent: () => import('./features/game/lobby/lobby.component').then(m => m.LobbyComponent)
      },
      {
        path: 'play/roulette/:id',
        loadComponent: () => import('./features/game/play/play.component').then(m => m.PlayComponent)
      },
      {
        path: 'play/cards/:id',
        loadComponent: () => import('./features/game/cards/play/cards-play.component').then(m => m.CardPlayComponent)
      },
      {
        path: 'impostor/play/:id',
        loadComponent: () => import('./features/game/impostor/play/impostor-play.component').then(m => m.ImpostorPlayComponent)
      },
      {
        path: 'mimic/play/:id',
        loadComponent: () => import('./features/game/mimic/play/mimic-play.component').then(m => m.MimicPlayComponent)
      },
      {
        path: 'join/:code',
        loadComponent: () => import('./features/game/join/join.component').then(m => m.JoinComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/select-game/select-game.component').then(m => m.SelectGameComponent)
  },
  {
    path: 'info',
    children: [
      {
        path: 'how-to-play',
        loadComponent: () => import('./features/info/how-to-play/how-to-play.component').then(m => m.HowToPlayComponent)
      },
      {
        path: 'privacy',
        loadComponent: () => import('./features/info/privacy/privacy.component').then(m => m.PrivacyComponent)
      },
      {
        path: 'terms',
        loadComponent: () => import('./features/info/terms/terms.component').then(m => m.TermsComponent)
      },
      {
        path: 'support',
        loadComponent: () => import('./features/info/support/support.component').then(m => m.SupportComponent)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
